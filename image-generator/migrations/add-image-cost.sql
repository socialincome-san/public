ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS cost_usd double precision CHECK (cost_usd >= 0);
