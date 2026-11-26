import { z } from "zod";

const apiHosts = {
  sandbox: "https://sandbox.qikink.com",
  live: "https://api.qikink.com",
};

export function getQikinkConfig() {
  const environment = process.env.QIKINK_MODE;
  const clientId = process.env.QIKINK_CLIENT_ID?.trim();
  const secret = process.env.QIKINK_CLIENT_SECRET?.trim();
  if ((environment !== "sandbox" && environment !== "live") || !clientId || !secret) return null;
  return { environment, clientId, secret, url: apiHosts[environment] };
}

type Config = NonNullable<ReturnType<typeof getQikinkConfig>>;
type Token = { value: string; expiresAt: number };
const tokens = new Map<string, Promise<Token>>();

export class QikinkError extends Error {
  constructor(message: string, readonly safeToRetry: boolean) {
    super(message);
  }
}

const identifier = z.union([z.string().regex(/^\d+$/), z.number().int().positive()]).transform(String);
const tokenSchema = z.object({ Accesstoken: z.string().min(1), expires_in: z.coerce.number().positive().catch(3600) });
const createdOrder = z.object({ order_id: identifier });
const shipment = z.object({
  order_id: z.union([z.string(), z.number()]).transform(String),
  qikink_order_id: identifier.optional(),
  status: z.string().max(120),
  tracking_link: z.string().optional(),
  tracking_url: z.string().optional(),
  shipping: z.object({ tracking_link: z.string().nullish() }).nullish(),
});
const errors = z.object({
  error: z.union([z.string(), z.boolean(), z.array(z.string())]).optional(),
  message: z.string().optional(),
  status_code: z.coerce.number().optional(),
  success: z.boolean().optional(),
});

async function call(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
  });
  const body: unknown = await response.json().catch(() => null);
  return { response, body };
}

async function getToken(config: Config) {
  const key = `${config.environment}:${config.clientId}`;
  const cached = tokens.get(key);
  if (cached) {
    const token = await cached;
    if (token.expiresAt > Date.now()) return token;
    if (tokens.get(key) !== cached) return getToken(config);
  }

  const request = (async () => {
    try {
      const { response, body } = await call(`${config.url}/api/token`, {
        method: "POST",
        body: new URLSearchParams({ ClientId: config.clientId, client_secret: config.secret }),
      });
      const token = tokenSchema.safeParse(body);
      if (response.ok && token.success) {
        const lifetime = Math.min(token.data.expires_in, 3600);
        return { value: token.data.Accesstoken, expiresAt: Date.now() + lifetime * 900 };
      }
    } catch {
      // No order request has been made.
    }
    throw new QikinkError("Could not authenticate with Qikink. Check the API connection and credentials.", true);
  })();
  tokens.set(key, request);
  try {
    return await request;
  } catch (error) {
    if (tokens.get(key) === request) tokens.delete(key);
    throw error;
  }
}

async function request(config: Config, path: string, payload?: object, retryAuth = true): Promise<unknown> {
  const token = await getToken(config);
  let result: Awaited<ReturnType<typeof call>>;
  try {
    result = await call(`${config.url}${path}`, {
      method: payload ? "POST" : "GET",
      headers: { ClientId: config.clientId, Accesstoken: token.value, "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
  } catch {
    throw new QikinkError("The Qikink request timed out or its response could not be reached.", false);
  }

  const { response, body } = result;
  const error = errors.safeParse(body).data;
  const status = Math.max(response.status, error?.status_code ?? 0);
  const message = typeof error?.error === "string" ? error.error : error?.message ?? "";
  if (status === 401 || /invalid (access.?token|client.?id)|token (expired|invalid)/i.test(message)) {
    if (retryAuth) {
      const key = `${config.environment}:${config.clientId}`;
      const cached = tokens.get(key);
      if (cached && await cached === token && tokens.get(key) === cached) tokens.delete(key);
      return request(config, path, payload, false);
    }
    throw new QikinkError("Qikink rejected the access token.", true);
  }
  if (status >= 400 || error?.error || error?.success === false) {
    if (status === 409 || /duplicate|already exists/i.test(message)) {
      throw new QikinkError("Qikink reported an existing order. Match the reference in its dashboard.", false);
    }
    if (/sku/i.test(message)) throw new QikinkError("Qikink rejected a product SKU. Check the purchased variant in Qikink My Products.", status < 500);
    if (/wallet|balance|credit/i.test(message)) throw new QikinkError("Qikink reported a wallet or balance issue.", status < 500);
    const safe = [400, 403, 422, 429].includes(status);
    throw new QikinkError(`Qikink rejected the request (status ${status}).`, safe);
  }
  return body;
}

export async function createQikinkOrder(config: Config, payload: object) {
  const body = createdOrder.safeParse(await request(config, "/api/order/create", payload));
  if (!body.success) throw new QikinkError("Qikink did not return a confirmed order ID.", false);
  return body.data.order_id;
}

export async function getQikinkShipment(config: Config, providerId: string, reference: string) {
  if (!identifier.safeParse(providerId).success) throw new Error("Enter a numeric Qikink order ID.");
  const body = await request(config, `/api/order?id=${encodeURIComponent(providerId)}`);
  const result = shipment.safeParse(Array.isArray(body) && body.length === 1 ? body[0] : body);
  if (!result.success) throw new Error("Qikink did not return an order with this ID.");
  const { order_id, qikink_order_id, status, tracking_link, tracking_url, shipping } = result.data;
  if (order_id.split("_").at(-1)?.toLowerCase() !== reference.toLowerCase() ||
      (qikink_order_id && qikink_order_id !== providerId)) {
    throw new Error("The Qikink order does not match the store reference.");
  }
  const trackingUrl = [shipping?.tracking_link, tracking_url, tracking_link].find((url): url is string =>
    !!url && URL.canParse(url) && new URL(url).protocol === "https:"
  );
  return { status, trackingUrl };
}
