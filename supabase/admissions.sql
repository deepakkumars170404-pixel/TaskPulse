-- TaskToggle: Student Admissions Table Migration
-- Run this in your Supabase SQL Editor if using Supabase Cloud

create table if not exists student_admissions (
  id text primary key,
  admission_no bigint not null,
  student_name text not null,
  course_name text not null,
  admission_date text not null,
  student_phone text,
  student_email text,
  fees_paid text,
  batch_timing text,
  notes text,
  staff_id text not null,
  staff_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table student_admissions enable row level security;

-- Allow public read/insert/update/delete for the app
create policy "Allow all operations for authenticated/anon users on student_admissions"
  on student_admissions for all
  using (true)
  with check (true);

-- Index for speedy queries by staff and admission number
create index if not exists idx_student_admissions_staff on student_admissions(staff_id);
create index if not exists idx_student_admissions_no on student_admissions(admission_no desc);

