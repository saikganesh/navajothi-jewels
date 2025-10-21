-- Add foreign key constraints for karat_14kt and karat_9kt tables
ALTER TABLE public.karat_14kt
ADD CONSTRAINT karat_14kt_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

ALTER TABLE public.karat_9kt
ADD CONSTRAINT karat_9kt_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;