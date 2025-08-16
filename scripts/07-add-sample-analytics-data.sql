-- Add sample analytics data for better demo experience
INSERT INTO public.agent_logs (agent_type, action, success, response_time_ms, channel, input_data, output_data)
VALUES 
  ('sales', 'lead_qualification', true, 1200, 'web_chat', '{"message": "Interested in CRM"}', '{"response": "Qualified lead"}'),
  ('support', 'customer_inquiry', true, 800, 'email', '{"subject": "Technical question"}', '{"response": "Issue resolved"}'),
  ('general', 'chat_interaction', true, 950, 'web_chat', '{"message": "Hello"}', '{"response": "How can I help?"}'),
  ('sales', 'follow_up', false, 2500, 'phone', '{"contact": "John Doe"}', '{"error": "No answer"}'),
  ('support', 'bug_report', true, 1800, 'web_chat', '{"issue": "Login problem"}', '{"response": "Bug fixed"}'),
  ('general', 'information_request', true, 600, 'email', '{"query": "Pricing info"}', '{"response": "Pricing sent"}'),
  ('sales', 'demo_scheduling', true, 1100, 'web_chat', '{"request": "Schedule demo"}', '{"response": "Demo scheduled"}'),
  ('support', 'account_issue', true, 1400, 'phone', '{"problem": "Account locked"}', '{"response": "Account unlocked"}')
ON CONFLICT (id) DO NOTHING;
