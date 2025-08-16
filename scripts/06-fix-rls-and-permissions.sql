-- Disable RLS and grant permissions for anonymous access
-- Disable Row Level Security on all tables
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to anonymous role
GRANT ALL ON public.contacts TO anon;
GRANT ALL ON public.agent_logs TO anon;
GRANT ALL ON public.settings TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure the tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    company character varying,
    status character varying DEFAULT 'Prospect',
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
    contact_id uuid REFERENCES public.contacts(id),
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

-- Insert some test data if tables are empty
INSERT INTO public.contacts (name, email, phone, company, status, notes)
SELECT 'John Doe', 'john@example.com', '+1234567890', 'Acme Corp', 'Client', 'Important client'
WHERE NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'john@example.com');

INSERT INTO public.contacts (name, email, phone, company, status, notes)
SELECT 'Jane Smith', 'jane@example.com', '+0987654321', 'Tech Solutions', 'Prospect', 'Potential lead'
WHERE NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'jane@example.com');

INSERT INTO public.contacts (name, email, company, status, notes)
SELECT 'Bob Johnson', 'bob@example.com', 'StartupXYZ', 'Inactive', 'Former client'
WHERE NOT EXISTS (SELECT 1 FROM public.contacts WHERE email = 'bob@example.com');
