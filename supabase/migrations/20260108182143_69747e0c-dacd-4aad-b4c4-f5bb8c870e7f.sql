-- Add new property characteristics columns
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS suites integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_pool boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_gym boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_elevator boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_balcony boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_barbecue boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_furnished boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS floor_number integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS year_built integer DEFAULT NULL;

-- Add constraint for occupancy_rate to be between 0 and 100
ALTER TABLE public.properties
ADD CONSTRAINT properties_occupancy_rate_check CHECK (occupancy_rate >= 0 AND occupancy_rate <= 100);