-- Final comprehensive setup script for the CRM system
-- This script ensures all tables, permissions, and sample data are properly configured

-- Ensure tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    email character varying NOT NULL UNIQUE,
    phone character varying,
    company character varying,
    status character varying DEFAULT 'Prospect' CHECK (status IN ('Prospect', 'Client', 'Inactive')),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action character varying NOT NULL,
    input_data jsonb,
    output_data jsonb,
    success boolean DEFAULT true,
    response_time_ms integer,
    contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    channel character varying DEFAULT 'web',
    agent_type character varying DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS public.settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key character varying NOT NULL UNIQUE,
    value text,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Disable RLS for all tables to allow anonymous access
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Grant comprehensive permissions to anonymous role
GRANT ALL PRIVILEGES ON public.contacts TO anon;
GRANT ALL PRIVILEGES ON public.agent_logs TO anon;
GRANT ALL PRIVILEGES ON public.settings TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_type ON public.agent_logs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_success ON public.agent_logs(success);

-- Insert sample contacts if table is empty
INSERT INTO public.contacts (name, email, phone, company, status, notes)
SELECT * FROM (VALUES
    ('John Smith', 'john.smith@techcorp.com', '+1-555-0101', 'TechCorp Solutions', 'Client', 'Enterprise client - high priority'),
    ('Sarah Johnson', 'sarah.j@innovate.io', '+1-555-0102', 'Innovate Labs', 'Prospect', 'Interested in premium features'),
    ('Michael Chen', 'mchen@startupxyz.com', '+1-555-0103', 'StartupXYZ', 'Prospect', 'Early stage startup - budget conscious'),
    ('Emily Davis', 'emily@globaltech.com', '+1-555-0104', 'Global Tech Inc', 'Client', 'Long-term client since 2022'),
    ('Robert Wilson', 'rwilson@consulting.biz', '+1-555-0105', 'Wilson Consulting', 'Inactive', 'Former client - contract ended'),
    ('Lisa Anderson', 'lisa@creativestudio.com', '+1-555-0106', 'Creative Studio', 'Prospect', 'Interested in design tools integration'),
    ('David Brown', 'david.brown@enterprise.com', '+1-555-0107', 'Enterprise Corp', 'Client', 'Multi-department deployment'),
    ('Jennifer Taylor', 'jtaylor@smallbiz.com', '+1-555-0108', 'Small Business Co', 'Prospect', 'Evaluating CRM options')
) AS new_contacts(name, email, phone, company, status, notes)
WHERE NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = new_contacts.email);

-- Insert sample agent logs for analytics
INSERT INTO public.agent_logs (agent_type, action, success, response_time_ms, channel, input_data, output_data, created_at)
SELECT * FROM (VALUES
    ('sales', 'lead_qualification', true, 1200, 'web_chat', '{"message": "Interested in CRM solution"}', '{"response": "Qualified as enterprise lead"}', now() - interval '2 hours'),
    ('support', 'customer_inquiry', true, 800, 'email', '{"subject": "Integration question"}', '{"response": "Provided API documentation"}', now() - interval '4 hours'),
    ('general', 'chat_interaction', true, 950, 'web_chat', '{"message": "Hello, need help"}', '{"response": "Connected to support agent"}', now() - interval '1 hour'),
    ('sales', 'follow_up_call', false, 2500, 'phone', '{"contact": "John Smith"}', '{"error": "No answer, left voicemail"}', now() - interval '6 hours'),
    ('support', 'bug_report', true, 1800, 'web_chat', '{"issue": "Login not working"}', '{"response": "Password reset sent"}', now() - interval '3 hours'),
    ('general', 'information_request', true, 600, 'email', '{"query": "Pricing information"}', '{"response": "Pricing guide sent"}', now() - interval '5 hours'),
    ('sales', 'demo_scheduling', true, 1100, 'web_chat', '{"request": "Schedule product demo"}', '{"response": "Demo scheduled for tomorrow"}', now() - interval '8 hours'),
    ('support', 'account_issue', true, 1400, 'phone', '{"problem": "Account access locked"}', '{"response": "Account unlocked successfully"}', now() - interval '12 hours'),
    ('sales', 'contract_negotiation', true, 2200, 'email', '{"stage": "final terms"}', '{"response": "Contract terms agreed"}', now() - interval '1 day'),
    ('general', 'feature_inquiry', true, 750, 'web_chat', '{"question": "Mobile app availability"}', '{"response": "Mobile app demo provided"}', now() - interval '18 hours')
) AS new_logs(agent_type, action, success, response_time_ms, channel, input_data, output_data, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.agent_logs WHERE action = new_logs.action AND created_at = new_logs.created_at);

-- Insert system settings
INSERT INTO public.settings (key, value, description)
VALUES 
    ('system_version', '2.0.0', 'Current CRM system version'),
    ('qwen_api_configured', 'true', 'Qwen AI integration status'),
    ('max_chat_history', '50', 'Maximum chat messages to retain'),
    ('analytics_retention_days', '90', 'Days to retain analytics data')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- Create a view for dashboard metrics
CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM public.contacts) as total_contacts,
    (SELECT COUNT(*) FROM public.contacts WHERE status = 'Client') as total_clients,
    (SELECT COUNT(*) FROM public.contacts WHERE status = 'Prospect') as total_prospects,
    (SELECT COUNT(*) FROM public.agent_logs) as total_interactions,
    (SELECT COUNT(*) FROM public.agent_logs WHERE success = true) as successful_interactions,
    (SELECT ROUND(AVG(response_time_ms)) FROM public.agent_logs WHERE response_time_ms IS NOT NULL) as avg_response_time;

-- Grant access to the view
GRANT SELECT ON public.dashboard_metrics TO anon;

-- Add helpful comments
COMMENT ON TABLE public.contacts IS 'Customer and prospect contact information';
COMMENT ON TABLE public.agent_logs IS 'AI agent interaction logs for analytics';
COMMENT ON TABLE public.settings IS 'System configuration settings';
COMMENT ON VIEW public.dashboard_metrics IS 'Pre-calculated metrics for dashboard performance';
