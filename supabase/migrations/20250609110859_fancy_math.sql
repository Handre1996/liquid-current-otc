/*
  # Create compliance and audit tables

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `action_type` (text, required)
      - `table_name` (text, nullable)
      - `record_id` (text, nullable)
      - `old_values` (jsonb, nullable)
      - `new_values` (jsonb, nullable)
      - `ip_address` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

    - `compliance_reports`
      - `id` (uuid, primary key)
      - `report_type` (text, required)
      - `report_period_start` (timestamp, required)
      - `report_period_end` (timestamp, required)
      - `generated_by` (uuid, required)
      - `file_path` (text, nullable)
      - `status` (text, required, default 'pending')
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamp, default now)
      - `completed_at` (timestamp, nullable)
      - `updated_at` (timestamp, default now)

    - `system_notifications`
      - `id` (uuid, primary key)
      - `notification_type` (text, required)
      - `title` (text, required)
      - `message` (text, required)
      - `severity` (text, required, default 'info')
      - `related_table` (text, nullable)
      - `related_id` (text, nullable)
      - `is_read` (boolean, default false)
      - `created_by` (uuid, nullable)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access and user-specific access where appropriate

  3. Indexes
    - Add indexes for commonly queried columns
*/

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action_type text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create compliance_reports table
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  report_period_start timestamp with time zone NOT NULL,
  report_period_end timestamp with time zone NOT NULL,
  generated_by uuid NOT NULL,
  file_path text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create system_notifications table
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  related_table text,
  related_id text,
  is_read boolean DEFAULT false NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.compliance_reports 
ADD CONSTRAINT compliance_reports_generated_by_fkey 
FOREIGN KEY (generated_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.system_notifications 
ADD CONSTRAINT system_notifications_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add check constraints
ALTER TABLE public.compliance_reports 
ADD CONSTRAINT compliance_reports_status_check 
CHECK (status IN ('pending', 'generating', 'completed', 'failed'));

ALTER TABLE public.system_notifications 
ADD CONSTRAINT system_notifications_severity_check 
CHECK (severity IN ('info', 'warning', 'error', 'critical'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_generated_by ON public.compliance_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON public.compliance_reports(status);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_report_type ON public.compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_created_at ON public.compliance_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_notifications_created_by ON public.system_notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_system_notifications_severity ON public.system_notifications(severity);
CREATE INDEX IF NOT EXISTS idx_system_notifications_is_read ON public.system_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON public.system_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create RLS policies for compliance_reports
CREATE POLICY "Admins can manage all compliance reports"
  ON public.compliance_reports
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  );

-- Create RLS policies for system_notifications
CREATE POLICY "Admins can manage all system notifications"
  ON public.system_notifications
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  );

CREATE POLICY "Users can view notifications addressed to them"
  ON public.system_notifications
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  );

CREATE POLICY "Users can update their own notification read status"
  ON public.system_notifications
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  )
  WITH CHECK (
    created_by = auth.uid() OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  );