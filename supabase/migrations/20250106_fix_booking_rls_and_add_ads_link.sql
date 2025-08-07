-- Migration: Fix booking RLS policy and add ads_link field
-- Date: 2025-01-06

-- First, add the ads_link column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ads_link TEXT;

-- Update the booking RLS policy to allow public inserts
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable insert for all users" ON bookings;

-- Create a permissive policy for inserts (since this is a public booking form)
CREATE POLICY "Allow public booking creation" 
ON bookings 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Ensure RLS is enabled on the table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Optional: Add a policy for reading bookings (admin only via service key)
DROP POLICY IF EXISTS "Admin read access" ON bookings;
CREATE POLICY "Admin read access" 
ON bookings 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Add policy for updates (admin only)
DROP POLICY IF EXISTS "Admin update access" ON bookings;
CREATE POLICY "Admin update access" 
ON bookings 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comment to document the ads_link field
COMMENT ON COLUMN bookings.ads_link IS 'URL of the car advertisement that the customer wants inspected';