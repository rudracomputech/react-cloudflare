
-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE public.app_role AS ENUM (
  'super_admin', 'admin', 'support_agent', 'fulfillment_agent', 'content_editor', 'customer'
);

CREATE TYPE public.order_status AS ENUM (
  'pending', 'awaiting_payment', 'paid', 'in_progress', 'delivered', 'cancelled', 'refunded', 'on_hold'
);

CREATE TYPE public.payment_status AS ENUM (
  'unpaid', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'
);

CREATE TYPE public.order_priority AS ENUM ('standard', 'urgent', 'vip', 'repeat');

-- =========================================================================
-- UTILITY: updated_at trigger fn
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  country TEXT,
  locale TEXT DEFAULT 'en',
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- USER ROLES
-- =========================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','admin','support_agent','fulfillment_agent','content_editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin')
  )
$$;

-- =========================================================================
-- AUTO PROFILE + CUSTOMER ROLE ON SIGNUP
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- SERVICES
-- =========================================================================
CREATE TABLE public.services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  eta_minutes_min INT,
  eta_minutes_max INT,
  active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- ORDERS
-- =========================================================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE n BIGINT;
BEGIN
  n := nextval('public.order_number_seq');
  RETURN 'AP-' || to_char(now(),'YYYYMMDD') || '-' || lpad(n::text, 6, '0');
END;
$$;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT public.generate_order_number(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  service_slug TEXT NOT NULL REFERENCES public.services(slug),
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  currency TEXT NOT NULL DEFAULT 'USD',
  amount NUMERIC(10,2) NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  country TEXT,
  ip TEXT,
  user_agent TEXT,
  locale TEXT,
  passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  coupon_code TEXT,
  disclaimer_accepted_at TIMESTAMPTZ,
  assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority public.order_priority NOT NULL DEFAULT 'standard',
  refund_risk_flag BOOLEAN NOT NULL DEFAULT false,
  internal_notes TEXT,                  -- admin-only
  customer_message TEXT,                -- customer-visible
  delivered_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- ORDER DOCUMENTS + DOWNLOAD AUDIT
-- =========================================================================
CREATE TABLE public.order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  download_count INT NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  last_download_ip TEXT,
  last_download_ua TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_document_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.order_documents(id) ON DELETE CASCADE,
  ip TEXT,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_document_downloads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- CONTENT TABLES
-- =========================================================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INT,
  discount_amount_usd NUMERIC(10,2),
  max_uses INT,
  uses_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_country TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_md TEXT NOT NULL,
  cover_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_guides_updated BEFORE UPDATE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.country_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.country_pages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_countries_updated BEFORE UPDATE ON public.country_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,             -- 'email' | 'whatsapp'
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reply_templates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

-- profiles
CREATE POLICY "Profiles: self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Profiles: admin manage" ON public.profiles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- user_roles
CREATE POLICY "Roles: self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Roles: admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- services (public read of active)
CREATE POLICY "Services: public read active" ON public.services FOR SELECT TO anon, authenticated USING (active = true AND deleted_at IS NULL);
CREATE POLICY "Services: admin manage" ON public.services FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- orders
CREATE POLICY "Orders: owner read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "Orders: owner insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orders: staff update" ON public.orders FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Orders: admin delete" ON public.orders FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- order_documents
CREATE POLICY "Docs: owner read" ON public.order_documents FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff(auth.uid())))
);
CREATE POLICY "Docs: staff manage" ON public.order_documents FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- order_document_downloads (admin-only)
CREATE POLICY "Downloads: admin only" ON public.order_document_downloads FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- order_events
CREATE POLICY "Events: owner read" ON public.order_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff(auth.uid())))
);
CREATE POLICY "Events: staff manage" ON public.order_events FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- coupons (admin only manage; codes validated server-side)
CREATE POLICY "Coupons: admin manage" ON public.coupons FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- testimonials (public read published)
CREATE POLICY "Testimonials: public read" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Testimonials: editor manage" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor')) WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor'));

-- blog_posts
CREATE POLICY "Blog: public read" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Blog: editor manage" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor')) WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor'));

-- guides
CREATE POLICY "Guides: public read" ON public.guides FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Guides: editor manage" ON public.guides FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor')) WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor'));

-- country_pages
CREATE POLICY "Countries: public read" ON public.country_pages FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Countries: editor manage" ON public.country_pages FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor')) WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor'));

-- faqs
CREATE POLICY "FAQs: public read" ON public.faqs FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "FAQs: editor manage" ON public.faqs FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor')) WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'content_editor'));

-- contact_messages
CREATE POLICY "Contact: anyone insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Contact: staff read" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Contact: staff update" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- reply_templates (staff only)
CREATE POLICY "Templates: staff read" ON public.reply_templates FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Templates: admin manage" ON public.reply_templates FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- settings (public flag controls anon read)
CREATE POLICY "Settings: public read" ON public.settings FOR SELECT TO anon, authenticated USING (is_public = true OR public.is_staff(auth.uid()));
CREATE POLICY "Settings: admin manage" ON public.settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- logs (admin only)
CREATE POLICY "AdminLogs: admin only" ON public.admin_activity_logs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "PaymentLogs: admin only" ON public.payment_logs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "EmailLogs: admin only" ON public.email_logs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================================
-- SEED DATA
-- =========================================================================
INSERT INTO public.services (slug, name, description, base_price, currency, eta_minutes_min, eta_minutes_max) VALUES
  ('flight-reservation', 'Flight Reservation', 'Verifiable flight reservation document for visa applications.', 19, 'USD', 18, 25),
  ('hotel-reservation',  'Hotel Reservation',  'Embassy-ready hotel booking confirmation for visa requirements.', 15, 'USD', 18, 25),
  ('onward-ticket',      'Onward Ticket',      'Proof of onward travel for entry and immigration requirements.', 12, 'USD', 15, 20),
  ('cover-letter',       'Cover Letter',       'Professional visa cover letter tailored to your itinerary.', 9, 'USD', 30, 60);

INSERT INTO public.settings (key, value, is_public) VALUES
  ('support_status', '"online"'::jsonb, true),
  ('delivery_eta',   '{"min":18,"max":25,"unit":"minutes"}'::jsonb, true),
  ('sla_threshold_minutes', '45'::jsonb, false),
  ('maintenance_mode', 'false'::jsonb, true),
  ('company_info', '{"name":"AeroPrior","email":"support@aeroprior.com","whatsapp":"+10000000000","hours":"24/7"}'::jsonb, true);
