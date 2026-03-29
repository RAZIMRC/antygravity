-- 1. Create Profiles table for Role-Based Access Control
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('admin', 'employee')) NOT NULL DEFAULT 'employee'
);

-- 2. Create Activity Logs table for tracking file uploads
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  export_filename TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('iOS', 'Desktop')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable row level security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Function to check if a user is an admin (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Everyone can read their own profile, Admins can read everything
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin(auth.uid()));

-- Activity Logs: Admins can read everything, Everyone can insert
CREATE POLICY "Anyone can log activity" ON activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view logs" ON activity_logs FOR SELECT USING (is_admin(auth.uid()));

-- 5. Trigger to automatically create a profile for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'employee'); -- Default to employee
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- IMPORTANT: 
-- 1. Manually update your own user to 'admin' in the 'profiles' table after signing up.
-- 2. Use the 'System Setup' button in the app to initialize the extra users.
