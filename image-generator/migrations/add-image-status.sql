ALTER TABLE generated_images
ADD COLUMN status text NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'deleted'));
