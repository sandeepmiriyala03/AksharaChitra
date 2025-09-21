-- Create table (run once)
CREATE TABLE IF NOT EXISTS global_image_count (
  id INTEGER PRIMARY KEY DEFAULT 1,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  count INTEGER DEFAULT 0
);

-- Insert initial record if missing
INSERT INTO global_image_count (id, count)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Create stored procedure for atomic increment
CREATE OR REPLACE FUNCTION increment_global_count()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE global_image_count
  SET count = count + 1
  WHERE id = 1;
END;
$$;
 