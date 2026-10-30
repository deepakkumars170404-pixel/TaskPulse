-- ==============================================================================
-- TaskToggle: Roles & Multi-Branch Schema Update
-- Run this script in Supabase SQL Editor if you want native DB-level columns
-- ==============================================================================

-- 1. Update users table role constraint to support Super Admin, Admin, Branch Manager, Staff
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'branch_manager', 'staff'));

-- 2. Add branch column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'branch') THEN
    ALTER TABLE public.users ADD COLUMN branch TEXT DEFAULT 'sivakasi 1.0';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'employee_id') THEN
    ALTER TABLE public.users ADD COLUMN employee_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'designation') THEN
    ALTER TABLE public.users ADD COLUMN designation TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'branch') THEN
    ALTER TABLE public.tasks ADD COLUMN branch TEXT;
  END IF;
END $$;

