-- Create admin user for testing
-- Email: admin, Password: admin

-- First, we need to insert into auth.users (this is handled by Supabase Auth)
-- But we can create a profile entry for when the admin user signs up

-- Insert admin profile (will be linked when user signs up)
INSERT INTO public.contacts (
  name,
  email,
  phone,
  company,
  status,
  notes,
  created_at
) VALUES (
  'System Administrator',
  'admin',
  '+1-555-0100',
  'CRM System',
  'Client',
  'System administrator account for testing and management',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create a settings table for API keys and configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert API configuration
INSERT INTO public.settings (key, value, description) VALUES 
  ('qwen_api_key', 'sk-f1a7ffe0627f455e81dd390127722aed', 'Alibaba Qwen API Key for AI functionality'),
  ('qwen_base_url', 'https://dashscope.aliyuncs.com/compatible-mode/v1', 'Base URL for Qwen API (OpenAI compatible)'),
  ('qwen_model', 'qwen-turbo', 'Default Qwen model to use')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
