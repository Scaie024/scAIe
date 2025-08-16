-- Insert sample contacts
INSERT INTO contacts (name, email, phone, company, status, notes) VALUES
('John Smith', 'john.smith@example.com', '+1-555-0101', 'Tech Corp', 'Prospect', 'Interested in enterprise solution'),
('Sarah Johnson', 'sarah.j@startup.io', '+1-555-0102', 'StartupIO', 'Client', 'Active customer since 2024'),
('Mike Chen', 'mike.chen@bigco.com', '+1-555-0103', 'BigCo Industries', 'Prospect', 'Needs pricing information'),
('Emily Davis', 'emily@freelance.com', '+1-555-0104', 'Freelance Design', 'Client', 'Monthly subscription'),
('Robert Wilson', 'r.wilson@corp.net', '+1-555-0105', 'Corp Networks', 'Inactive', 'Contract ended'),
('Lisa Anderson', 'lisa@agency.com', '+1-555-0106', 'Creative Agency', 'Prospect', 'Scheduled demo for next week'),
('David Brown', 'david.brown@tech.com', '+1-555-0107', 'TechSolutions', 'Client', 'Premium plan customer'),
('Jennifer Lee', 'jen.lee@consulting.biz', '+1-555-0108', 'Lee Consulting', 'Prospect', 'Evaluating options');

-- Insert sample agent logs
INSERT INTO agent_logs (agent_type, action, input_data, output_data, success, response_time_ms, channel, contact_id) VALUES
('sales', 'qualify_lead', '{"email": "john.smith@example.com"}', '{"score": 85, "priority": "high"}', true, 1200, 'web', (SELECT id FROM contacts WHERE email = 'john.smith@example.com')),
('support', 'answer_query', '{"question": "pricing info"}', '{"response": "sent pricing sheet"}', true, 800, 'email', (SELECT id FROM contacts WHERE email = 'sarah.j@startup.io')),
('sales', 'schedule_demo', '{"contact": "mike.chen@bigco.com"}', '{"scheduled": "2024-01-15T10:00:00Z"}', true, 600, 'web', (SELECT id FROM contacts WHERE email = 'mike.chen@bigco.com')),
('support', 'handle_complaint', '{"issue": "billing error"}', '{"resolved": true}', true, 2100, 'phone', (SELECT id FROM contacts WHERE email = 'emily@freelance.com')),
('sales', 'follow_up', '{"contact": "lisa@agency.com"}', '{"email_sent": true}', true, 400, 'email', (SELECT id FROM contacts WHERE email = 'lisa@agency.com')),
('sales', 'qualify_lead', '{"email": "invalid@test.com"}', '{"error": "contact not found"}', false, 300, 'web', NULL);
