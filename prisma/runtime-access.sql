-- Run as the migration owner after creating the dedicated rore_store_app login.
-- Browser clients retain no policy granting them access to these tables.
GRANT USAGE ON SCHEMA public, rore_private TO rore_store_app;
GRANT SELECT, INSERT ON public."User" TO rore_store_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Address", public."CartItem", public."Category", public."Product" TO rore_store_app;
GRANT SELECT, INSERT, UPDATE ON public."Order" TO rore_store_app;
GRANT SELECT, INSERT ON public."OrderItem" TO rore_store_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON rore_private.auth_attempt TO rore_store_app;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rore_runtime_read ON public."User" FOR SELECT TO rore_store_app USING (true);
CREATE POLICY rore_customer_registration ON public."User" FOR INSERT TO rore_store_app WITH CHECK (role = 'CUSTOMER');
ALTER TABLE public."Address" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rore_runtime ON public."Address" TO rore_store_app USING (true) WITH CHECK (true);
ALTER TABLE public."CartItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rore_runtime ON public."CartItem" TO rore_store_app USING (true) WITH CHECK (true);
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rore_runtime ON public."Category" TO rore_store_app USING (true) WITH CHECK (true);
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rore_runtime ON public."Product" TO rore_store_app USING (true) WITH CHECK (true);
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rore_runtime ON public."Order" TO rore_store_app USING (true) WITH CHECK (true);
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rore_runtime ON public."OrderItem" TO rore_store_app USING (true) WITH CHECK (true);
