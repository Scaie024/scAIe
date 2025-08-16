-- Simple admin setup script
-- This creates the necessary tables and data for the admin user

-- Ensure contacts table exists with proper structure
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Prospect',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin contact record
INSERT INTO public.contacts (
  name,
  email,
  phone,
  company,
  status,
  notes
) VALUES (
  'System Administrator',
  'admin',
  '+1-555-0100',
  'CRM System',
  'Client',
  'System administrator account - Login: admin/admin'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Create settings table for API keys
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert API configuration
INSERT INTO public.settings (key, value, description) VALUES 
  ('qwen_api_key', 'sk-f1a7ffe0627f455e81dd390127722aed', 'Alibaba Qwen API Key'),
  ('qwen_base_url', 'https://dashscope.aliyuncs.com/compatible-mode/v1', 'Qwen API Base URL'),
  ('qwen_model', 'qwen-turbo', 'Default Qwen model')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value;
