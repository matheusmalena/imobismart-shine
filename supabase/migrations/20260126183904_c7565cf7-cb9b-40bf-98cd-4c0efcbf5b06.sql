-- Add other_amenities column to properties table for custom amenities
ALTER TABLE public.properties
ADD COLUMN other_amenities text NULL;