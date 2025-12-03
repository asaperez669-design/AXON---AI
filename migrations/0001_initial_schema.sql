-- Account Notes table
CREATE TABLE IF NOT EXISTS account_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT NOT NULL,
  note_title TEXT NOT NULL,
  note_content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer Documents table
CREATE TABLE IF NOT EXISTS customer_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_content TEXT NOT NULL,
  account_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Territory Plans table
CREATE TABLE IF NOT EXISTS territory_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_name TEXT NOT NULL,
  territory_name TEXT NOT NULL,
  plan_content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1:1 Documents table
CREATE TABLE IF NOT EXISTS one_on_one_docs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  manager_name TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  topics TEXT NOT NULL,
  notes TEXT NOT NULL,
  action_items TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_account_notes_account ON account_notes(account_name);
CREATE INDEX IF NOT EXISTS idx_customer_documents_account ON customer_documents(account_name);
CREATE INDEX IF NOT EXISTS idx_territory_plans_territory ON territory_plans(territory_name);
CREATE INDEX IF NOT EXISTS idx_one_on_one_manager ON one_on_one_docs(manager_name);
CREATE INDEX IF NOT EXISTS idx_one_on_one_date ON one_on_one_docs(meeting_date);
