-- ==============================================================================
-- TaskToggle Supabase Database Schema
-- Run this complete script in your Supabase Project -> SQL Editor to initialize
-- Organization: Deepak
-- ==============================================================================

-- 1. Create USERS table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  initials TEXT,
  avatar_bg TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create TASKS table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_by_name TEXT NOT NULL,
  assigned_to TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_to_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin', 'staff', 'self')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date TEXT NOT NULL,
  due_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'done')),
  pending_reason TEXT,
  pending_reason_updated_at TEXT,
  accepted_at TEXT,
  completed_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create OFFICE_TIMING table
CREATE TABLE IF NOT EXISTS public.office_timing (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  open_time TEXT NOT NULL DEFAULT '09:30 AM',
  close_time TEXT NOT NULL DEFAULT '06:30 PM',
  working_days TEXT[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create EVENT_TIMING table
CREATE TABLE IF NOT EXISTS public.event_timing (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  date TEXT NOT NULL,
  new_timing TEXT NOT NULL,
  allotted_staff_ids TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create ORG_SETTINGS table (Organization: Deepak)
CREATE TABLE IF NOT EXISTS public.org_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  org_name TEXT NOT NULL DEFAULT 'Deepak',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_timing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_timing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

-- Allow read/write access with Supabase anon key
CREATE POLICY "Allow anon select users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anon insert/update users" ON public.users FOR ALL USING (true);

CREATE POLICY "Allow anon select tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow anon all tasks" ON public.tasks FOR ALL USING (true);

CREATE POLICY "Allow anon select office_timing" ON public.office_timing FOR SELECT USING (true);
CREATE POLICY "Allow anon all office_timing" ON public.office_timing FOR ALL USING (true);

CREATE POLICY "Allow anon select event_timing" ON public.event_timing FOR SELECT USING (true);
CREATE POLICY "Allow anon all event_timing" ON public.event_timing FOR ALL USING (true);

CREATE POLICY "Allow anon select org_settings" ON public.org_settings FOR SELECT USING (true);
CREATE POLICY "Allow anon all org_settings" ON public.org_settings FOR ALL USING (true);

-- Enable Realtime for live multi-device synchronization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'office_timing'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.office_timing;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'org_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.org_settings;
  END IF;
END $$;

-- 6. Seed Default Initial Data
INSERT INTO public.users (id, name, email, role, initials, avatar_bg) VALUES
  ('admin_deepak', 'Deepak (Admin)', 'admin@company.com', 'admin', 'DA', 'bg-indigo-600'),
  ('staff_priya', 'Priya Sharma', 'priya@company.com', 'staff', 'PS', 'bg-sky-600'),
  ('staff_arun', 'Arun Patel', 'arun@company.com', 'staff', 'AP', 'bg-emerald-600'),
  ('staff_meena', 'Meena Sundaram', 'meena@company.com', 'staff', 'MS', 'bg-purple-600'),
  ('staff_karthik', 'Karthik Rao', 'karthik@company.com', 'staff', 'KR', 'bg-amber-600')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

INSERT INTO public.office_timing (id, open_time, close_time, working_days) VALUES
  ('primary', '09:30 AM', '06:30 PM', ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
ON CONFLICT (id) DO UPDATE SET
  open_time = EXCLUDED.open_time,
  close_time = EXCLUDED.close_time;

-- Insert organization named Deepak
INSERT INTO public.org_settings (id, org_name) VALUES
  ('primary', 'Deepak')
ON CONFLICT (id) DO UPDATE SET
  org_name = EXCLUDED.org_name;

INSERT INTO public.event_timing (id, event_name, date, new_timing, allotted_staff_ids, is_active) VALUES
  ('evt_annual_2026', 'Annual Day Preparation', '26 Oct 2026', '8:00 AM - 6:00 PM', ARRAY['staff_arun', 'staff_meena', 'staff_priya', 'staff_karthik'], TRUE)
ON CONFLICT (id) DO NOTHING;
