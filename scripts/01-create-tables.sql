-- Create contacts table for CRM
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Prospect' CHECK (status IN ('Prospect', 'Client', 'Inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_logs table for analytics
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  success BOOLEAN DEFAULT true,
  response_time_ms INTEGER,
  channel VARCHAR(50) DEFAULT 'web',
  contact_id UUID REFERENCES contacts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_type ON agent_logs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_success ON agent_logs(success);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON agent_logs
  FOR ALL USING (auth.role() = 'authenticated');
