-- This script should be run after creating your first admin user manually
-- Replace 'your-admin-user-id' with the actual UUID of your admin user

-- Example: Update a specific user to have admin role
-- You'll need to replace this UUID with your actual admin user's UUID
-- INSERT INTO user_roles (user_id, role, assigned_by) 
-- VALUES ('your-admin-user-id', 'admin', 'your-admin-user-id')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- For demo purposes, we'll create a function to promote the first user to admin
CREATE OR REPLACE FUNCTION promote_first_user_to_admin()
RETURNS VOID AS $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first user ID
  SELECT id INTO first_user_id 
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1;
  
  -- If a user exists, make them admin
  IF first_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role, assigned_by) 
    VALUES (first_user_id, 'admin', first_user_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the function (you can run this manually after creating your first user)
-- SELECT promote_first_user_to_admin();
