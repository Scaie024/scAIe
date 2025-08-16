-- Disable RLS and create public access policies for CRM tables
-- Disable Row Level Security for all CRM tables to allow anonymous access
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs DISABLE ROW LEVEL SECURITY;

-- Alternative: If you prefer to keep RLS enabled, create policies for anonymous access
-- DROP POLICY IF EXISTS "Enable all operations for anonymous users" ON contacts;
-- CREATE POLICY "Enable all operations for anonymous users" ON contacts
--   FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable all operations for anonymous users" ON agent_logs;  
-- CREATE POLICY "Enable all operations for anonymous users" ON agent_logs
--   FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions to anonymous role
GRANT ALL ON contacts TO anon;
GRANT ALL ON agent_logs TO anon;
GRANT USAGE ON SEQUENCE contacts_id_seq TO anon;
GRANT USAGE ON SEQUENCE agent_logs_id_seq TO anon;
