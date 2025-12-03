-- Sample Accounts
INSERT OR IGNORE INTO accounts (id, account_name, company_type, industry, status) VALUES 
  (1, 'Acme Corp', 'Enterprise', 'Manufacturing', 'active'),
  (2, 'TechStart Inc', 'Mid-Market', 'Technology', 'active'),
  (3, 'Global Solutions', 'Enterprise', 'Financial Services', 'active');

-- Sample Account Notes (with account_id)
INSERT OR IGNORE INTO account_notes (account_name, note_title, note_content, account_id) VALUES 
  ('Acme Corp', 'Initial Meeting Notes', 'Discussed Q4 requirements. They are interested in our enterprise package. Follow up next week with proposal.', 1),
  ('TechStart Inc', 'Product Demo Feedback', 'Very impressed with the analytics dashboard. Requested custom integration with their CRM system.', 2),
  ('Global Solutions', 'Contract Renewal Discussion', 'Contract expires in 2 months. They want to expand to 3 more departments. Prepare expansion proposal.', 3);

-- Sample Tasks
INSERT OR IGNORE INTO tasks (task_title, task_description, status, priority, due_date) VALUES 
  ('Follow up with Acme Corp', 'Send enterprise package proposal and pricing breakdown', 'pending', 'high', '2025-12-10'),
  ('Schedule TechStart demo', 'Set up custom CRM integration demo with technical team', 'pending', 'high', '2025-12-08'),
  ('Prepare Q1 forecast', 'Compile pipeline data and revenue projections for quarterly review', 'pending', 'medium', '2025-12-15'),
  ('Update CRM records', 'Add new contacts from recent conferences', 'completed', 'low', '2025-12-01'),
  ('Review contract terms', 'Legal review of Global Solutions expansion agreement', 'pending', 'high', '2025-12-12');

-- Sample Customer Documents
INSERT OR IGNORE INTO customer_documents (document_name, document_type, document_content, account_name) VALUES 
  ('Acme Corp - Proposal 2024', 'Proposal', 'Enterprise package proposal including 100 seats, premium support, and custom integrations.', 'Acme Corp'),
  ('TechStart - SOW', 'Statement of Work', 'Implementation timeline: 6 weeks. Includes data migration, training, and go-live support.', 'TechStart Inc'),
  ('Global Solutions - Contract', 'Contract', 'Annual subscription with quarterly reviews and dedicated account manager.', 'Global Solutions');

-- Sample Territory Plans
INSERT OR IGNORE INTO territory_plans (plan_name, territory_name, plan_content, status, account_type) VALUES 
  ('Q1 2024 Northeast Plan - Growth', 'Northeast', 'Target: 10 renewal accounts, $1.5M revenue. Focus on expanding existing relationships in financial services.', 'active', 'growth'),
  ('Q1 2024 Northeast Plan - Acquisition', 'Northeast', 'Target: 15 new accounts, $2M revenue. Focus on net new prospects in healthcare sector.', 'active', 'acquisition'),
  ('Q1 2024 West Coast Plan - Growth', 'West Coast', 'Target: 8 rewrite/renewal accounts, $1.8M revenue. Upsell to tech startups currently on basic plans.', 'active', 'growth'),
  ('Q1 2024 West Coast Plan - Acquisition', 'West Coast', 'Target: 20 new accounts, $3M revenue. Focus on net new SaaS companies and scale-ups.', 'active', 'acquisition'),
  ('Q2 2024 Midwest Plan', 'Midwest', 'Target: 12 new accounts, $1.5M revenue. Focus on manufacturing and logistics.', 'draft', 'acquisition');

-- Sample 1:1 Documents
INSERT OR IGNORE INTO one_on_one_docs (manager_name, meeting_date, topics, notes, action_items) VALUES 
  ('Sarah Johnson', '2024-12-01', 'Q4 Performance, Pipeline Review', 'Strong quarter with 110% of quota. Pipeline for Q1 looks healthy. Discussed promotion path.', 'Complete certification by end of month, Schedule customer success training'),
  ('Sarah Johnson', '2024-11-15', 'Deal Strategy, Training Needs', 'Working on Acme Corp deal. Need help with enterprise pricing. Requested sales engineering support.', 'Connect with sales engineering team, Review enterprise pricing guide'),
  ('Mike Chen', '2024-11-30', 'Territory Planning, Goal Setting', 'Planning for Q1. Identified 5 strategic accounts to focus on. Need marketing support for events.', 'Submit event budget proposal, Create target account list');
