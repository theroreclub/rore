import { createHmac, randomInt } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function allowAuthAttempt(action: "login" | "signup", email: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  const header = process.env.AUTH_CLIENT_IP_HEADER;
  const ip = header ? (await headers()).get(header)?.trim() : null;
  // On a direct server there is no trustworthy IP in request headers.
  const source = ip && isIP(ip) ? ip : "shared";
  const bucket = (type: string, value: string) =>
    createHmac("sha256", secret).update(JSON.stringify([action, type, value])).digest("hex");

  if (randomInt(64) === 0) {
    await prisma.$executeRaw`DELETE FROM rore_private.auth_attempt WHERE expires_at < now() - interval '1 hour'`;
  }
  // Only allocate an email bucket when the source budget admits the request.
  const result = await prisma.$queryRaw<{ allowed: boolean }[]>`
    WITH source_attempt AS (
      INSERT INTO rore_private.auth_attempt AS c (bucket, attempts, expires_at)
      VALUES (${bucket("source", source)}, 1, now() + interval '15 minutes')
      ON CONFLICT (bucket) DO UPDATE SET
        attempts = CASE WHEN c.expires_at <= now() THEN 1 ELSE c.attempts + 1 END,
        expires_at = CASE WHEN c.expires_at <= now() THEN EXCLUDED.expires_at ELSE c.expires_at END
      WHERE c.expires_at <= now() OR c.attempts < ${action === "login" ? 60 : 20}
      RETURNING 1
    ), account_attempt AS (
      INSERT INTO rore_private.auth_attempt AS c (bucket, attempts, expires_at)
      SELECT ${bucket("email", email.toLowerCase())}, 1, now() + interval '15 minutes' FROM source_attempt
      ON CONFLICT (bucket) DO UPDATE SET
        attempts = CASE WHEN c.expires_at <= now() THEN 1 ELSE c.attempts + 1 END,
        expires_at = CASE WHEN c.expires_at <= now() THEN EXCLUDED.expires_at ELSE c.expires_at END
      WHERE c.expires_at <= now() OR c.attempts < ${action === "login" ? 10 : 5}
      RETURNING 1
    ) SELECT EXISTS (SELECT FROM account_attempt) AS allowed`;
  return result[0].allowed;
}
