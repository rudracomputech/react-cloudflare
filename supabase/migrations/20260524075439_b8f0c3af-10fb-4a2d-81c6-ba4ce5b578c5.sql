-- Stripe reconciliation columns on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- Private bucket for delivered documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-documents', 'order-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: staff manage, owners read (used by server-side signed URLs anyway)
DROP POLICY IF EXISTS "Docs: staff manage objects" ON storage.objects;
CREATE POLICY "Docs: staff manage objects"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'order-documents' AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'order-documents' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Docs: owner read objects" ON storage.objects;
CREATE POLICY "Docs: owner read objects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-documents'
  AND EXISTS (
    SELECT 1 FROM public.order_documents d
    JOIN public.orders o ON o.id = d.order_id
    WHERE d.storage_path = storage.objects.name
      AND (o.user_id = auth.uid() OR public.is_staff(auth.uid()))
  )
);

-- Seed operational settings (public-readable for site widgets)
INSERT INTO public.settings (key, value, is_public) VALUES
  ('support_status', '{"status":"online","label":"Support online","reply_minutes":10}'::jsonb, true),
  ('delivery_eta',   '{"min_minutes":18,"max_minutes":25}'::jsonb, true),
  ('company_info',   '{"brand":"AeroPrior","email":"support@aeroprior.com","whatsapp":"+10000000000","address":"","support_hours":"24/7"}'::jsonb, true),
  ('maintenance_mode','{"enabled":false,"message":""}'::jsonb, true),
  ('sla_threshold',  '{"minutes":30}'::jsonb, false)
ON CONFLICT (key) DO NOTHING;

-- Seed a few reply templates
INSERT INTO public.reply_templates (channel, title, body_md) VALUES
  ('email','Order received','Hi {{name}},\n\nWe''ve received your order **{{order_number}}** and our team is on it. You''ll receive your document within {{eta}}.\n\n— AeroPrior'),
  ('email','Document delivered','Hi {{name}},\n\nYour reservation for **{{order_number}}** is attached. It''s verifiable for {{validity}}.\n\nThanks for choosing AeroPrior.'),
  ('whatsapp','Quick reply — ETA','Hi! Your order {{order_number}} is being processed and will be delivered within {{eta}}.')
ON CONFLICT DO NOTHING;