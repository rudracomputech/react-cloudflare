
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
DECLARE n BIGINT;
BEGIN
  n := nextval('public.order_number_seq');
  RETURN 'AP-' || to_char(now(),'YYYYMMDD') || '-' || lpad(n::text, 6, '0');
END;
$$;
