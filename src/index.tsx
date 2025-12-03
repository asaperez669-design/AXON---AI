import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============ Account Notes API ============
app.get('/api/notes', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM account_notes ORDER BY updated_at DESC'
    ).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/api/notes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM account_notes WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Note not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.post('/api/notes', async (c) => {
  try {
    const { account_name, note_title, note_content } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO account_notes (account_name, note_title, note_content) VALUES (?, ?, ?)'
    ).bind(account_name, note_title, note_content).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.put('/api/notes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { account_name, note_title, note_content } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE account_notes SET account_name = ?, note_title = ?, note_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(account_name, note_title, note_content, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.delete('/api/notes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM account_notes WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============ Customer Documents API ============
app.get('/api/documents', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM customer_documents ORDER BY updated_at DESC'
    ).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/api/documents/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM customer_documents WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Document not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.post('/api/documents', async (c) => {
  try {
    const { document_name, document_type, document_content, account_name } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO customer_documents (document_name, document_type, document_content, account_name) VALUES (?, ?, ?, ?)'
    ).bind(document_name, document_type, document_content, account_name).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.put('/api/documents/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { document_name, document_type, document_content, account_name } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE customer_documents SET document_name = ?, document_type = ?, document_content = ?, account_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(document_name, document_type, document_content, account_name, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.delete('/api/documents/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM customer_documents WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============ Territory Plans API ============
app.get('/api/plans', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM territory_plans ORDER BY updated_at DESC'
    ).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/api/plans/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM territory_plans WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Plan not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.post('/api/plans', async (c) => {
  try {
    const { plan_name, territory_name, plan_content, status, account_type } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO territory_plans (plan_name, territory_name, plan_content, status, account_type) VALUES (?, ?, ?, ?, ?)'
    ).bind(plan_name, territory_name, plan_content, status || 'draft', account_type || 'growth').run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.put('/api/plans/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { plan_name, territory_name, plan_content, status, account_type } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE territory_plans SET plan_name = ?, territory_name = ?, plan_content = ?, status = ?, account_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(plan_name, territory_name, plan_content, status, account_type, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.delete('/api/plans/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM territory_plans WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============ 1:1 Documents API ============
app.get('/api/oneononedocs', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM one_on_one_docs ORDER BY meeting_date DESC, updated_at DESC'
    ).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/api/oneononedocs/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM one_on_one_docs WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Document not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.post('/api/oneononedocs', async (c) => {
  try {
    const { manager_name, meeting_date, topics, notes, action_items } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO one_on_one_docs (manager_name, meeting_date, topics, notes, action_items) VALUES (?, ?, ?, ?, ?)'
    ).bind(manager_name, meeting_date, topics, notes, action_items || '').run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.put('/api/oneononedocs/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { manager_name, meeting_date, topics, notes, action_items } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE one_on_one_docs SET manager_name = ?, meeting_date = ?, topics = ?, notes = ?, action_items = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(manager_name, meeting_date, topics, notes, action_items, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.delete('/api/oneononedocs/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM one_on_one_docs WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============ Tasks API ============
app.get('/api/tasks', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM tasks ORDER BY due_date ASC, created_at DESC'
    ).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/api/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM tasks WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Task not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.post('/api/tasks', async (c) => {
  try {
    const { task_title, task_description, priority, due_date } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO tasks (task_title, task_description, priority, due_date, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(task_title, task_description || '', priority || 'medium', due_date || null, 'pending').run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.put('/api/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { task_title, task_description, priority, due_date, status } = await c.req.json()
    
    const completed_at = status === 'completed' ? 'CURRENT_TIMESTAMP' : 'NULL'
    
    await c.env.DB.prepare(
      `UPDATE tasks SET task_title = ?, task_description = ?, priority = ?, due_date = ?, status = ?, completed_at = ${completed_at}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(task_title, task_description, priority, due_date, status, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.patch('/api/tasks/:id/toggle', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Get current status
    const { results } = await c.env.DB.prepare(
      'SELECT status FROM tasks WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Task not found' }, 404)
    }
    
    const currentStatus = results[0].status
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const completed_at = newStatus === 'completed' ? 'CURRENT_TIMESTAMP' : 'NULL'
    
    await c.env.DB.prepare(
      `UPDATE tasks SET status = ?, completed_at = ${completed_at}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(newStatus, id).run()
    
    return c.json({ success: true, status: newStatus })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.delete('/api/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============ Accounts API ============
app.get('/api/accounts', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM accounts ORDER BY account_name ASC'
    ).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/api/accounts/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM accounts WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Account not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/api/accounts/:id/notes', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM account_notes WHERE account_id = ? ORDER BY updated_at DESC'
    ).bind(id).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.post('/api/accounts', async (c) => {
  try {
    const { account_name, company_type, industry } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO accounts (account_name, company_type, industry, status) VALUES (?, ?, ?, ?)'
    ).bind(account_name, company_type || '', industry || '', 'active').run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.put('/api/accounts/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { account_name, company_type, industry, status } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE accounts SET account_name = ?, company_type = ?, industry = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(account_name, company_type, industry, status, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.delete('/api/accounts/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Update notes POST to include account_id
app.post('/api/accounts/:accountId/notes', async (c) => {
  try {
    const accountId = c.req.param('accountId')
    const { note_title, note_content } = await c.req.json()
    
    // Get account name
    const { results: accountResults } = await c.env.DB.prepare(
      'SELECT account_name FROM accounts WHERE id = ?'
    ).bind(accountId).all()
    
    if (accountResults.length === 0) {
      return c.json({ success: false, error: 'Account not found' }, 404)
    }
    
    const account_name = accountResults[0].account_name
    
    const result = await c.env.DB.prepare(
      'INSERT INTO account_notes (account_name, note_title, note_content, account_id) VALUES (?, ?, ?, ?)'
    ).bind(account_name, note_title, note_content, accountId).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ============ Main Page ============
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workflow - Sales Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            axon: {
                                black: '#0a0a0a',
                                yellow: '#FFC600',
                                'yellow-light': '#FFD93D',
                                'yellow-dark': '#E6B000',
                                'gray-darker': '#0f0f0f',
                                'gray-dark': '#1a1a1a',
                                'gray-medium': '#2a2a2a',
                                'gray-light': '#3a3a3a'
                            }
                        },
                        fontFamily: {
                            sans: ['Inter', 'system-ui', 'sans-serif']
                        }
                    }
                }
            }
        </script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            * {
                font-family: 'Inter', system-ui, sans-serif;
            }
            body { 
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                min-height: 100vh;
            }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .tab-button {
                position: relative;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tab-button.active { 
                background: linear-gradient(135deg, #FFC600 0%, #FFD93D 100%);
                color: #000000;
                font-weight: 600;
                box-shadow: 0 4px 20px rgba(255, 198, 0, 0.3);
            }
            .tab-button.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #FFC600, #FFD93D);
            }
            .tab-button:hover:not(.active) {
                background-color: #2a2a2a;
                color: #FFC600;
                transform: translateY(-2px);
            }
            .modal {
                display: none;
                position: fixed;
                z-index: 50;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.85);
                backdrop-filter: blur(8px);
            }
            .modal.active { 
                display: flex; 
                animation: fadeIn 0.2s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .modal-content {
                background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
                margin: auto;
                padding: 32px;
                border: 1px solid #3a3a3a;
                border-radius: 16px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                            0 0 0 1px rgba(255, 198, 0, 0.1);
                animation: slideUp 0.3s ease-out;
            }
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px); 
                }
                to { 
                    opacity: 1;
                    transform: translateY(0); 
                }
            }
            textarea {
                min-height: 100px;
            }
            input, textarea, select {
                background-color: #0f0f0f;
                border: 1px solid #3a3a3a;
                color: #ffffff;
                transition: all 0.2s ease;
            }
            input:hover, textarea:hover, select:hover {
                border-color: #4a4a4a;
            }
            input:focus, textarea:focus, select:focus {
                border-color: #FFC600;
                ring-color: #FFC600;
                box-shadow: 0 0 0 3px rgba(255, 198, 0, 0.1);
                outline: none;
            }
            label {
                color: #e0e0e0;
                font-weight: 500;
                font-size: 0.875rem;
            }
            .filter-button {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid transparent;
            }
            .filter-button:hover:not(.active) {
                background-color: #2a2a2a;
                border-color: #3a3a3a;
                transform: translateY(-1px);
            }
            .filter-button.active {
                background: linear-gradient(135deg, #FFC600 0%, #FFD93D 100%);
                color: #000000;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(255, 198, 0, 0.25);
            }
            .card {
                background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
                border: 1px solid #2a2a2a;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .card:hover {
                border-color: #3a3a3a;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3),
                            0 0 0 1px rgba(255, 198, 0, 0.1);
                transform: translateY(-2px);
            }
            .btn-primary {
                background: linear-gradient(135deg, #FFC600 0%, #FFD93D 100%);
                color: #000000;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(255, 198, 0, 0.25);
            }
            .btn-primary:hover {
                box-shadow: 0 6px 20px rgba(255, 198, 0, 0.4);
                transform: translateY(-2px);
            }
            .btn-secondary {
                background-color: #2a2a2a;
                color: #e0e0e0;
                border: 1px solid #3a3a3a;
                transition: all 0.2s ease;
            }
            .btn-secondary:hover {
                background-color: #3a3a3a;
                border-color: #4a4a4a;
            }
            ::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #0f0f0f;
            }
            ::-webkit-scrollbar-thumb {
                background: #3a3a3a;
                border-radius: 5px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #4a4a4a;
            }
        </style>
    </head>
    <body class="bg-gray-900">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="relative bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-2xl border-b border-gray-800">
                <div class="absolute inset-0 bg-gradient-to-r from-yellow-600/5 via-transparent to-yellow-600/5"></div>
                <div class="max-w-7xl mx-auto px-6 py-6 relative">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                                <i class="fas fa-briefcase mr-3"></i>
                                Workflow
                            </h1>
                            <p class="text-gray-400 mt-1 text-sm font-medium">Sales Operations Platform</p>
                        </div>
                        <div class="hidden md:flex items-center space-x-4">
                            <div class="text-right">
                                <p class="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                                <div class="flex items-center mt-1">
                                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                    <span class="text-sm text-gray-300 font-medium">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Tab Navigation -->
            <div class="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
                <div class="max-w-7xl mx-auto px-6">
                    <nav class="flex space-x-1 overflow-x-auto">
                        <button onclick="switchTab('accounts')" class="tab-button active px-6 py-4 font-medium transition-colors whitespace-nowrap">
                            <i class="fas fa-building mr-2"></i>Accounts
                        </button>
                        <button onclick="switchTab('tasks')" class="tab-button px-6 py-4 font-medium transition-colors text-gray-400 whitespace-nowrap">
                            <i class="fas fa-tasks mr-2"></i>Tasks
                        </button>
                        <button onclick="switchTab('documents')" class="tab-button px-6 py-4 font-medium transition-colors text-gray-400 whitespace-nowrap">
                            <i class="fas fa-file-alt mr-2"></i>Documents
                        </button>
                        <button onclick="switchTab('plans')" class="tab-button px-6 py-4 font-medium transition-colors text-gray-400 whitespace-nowrap">
                            <i class="fas fa-map mr-2"></i>Territory Plans
                        </button>
                        <button onclick="switchTab('oneononedocs')" class="tab-button px-6 py-4 font-medium transition-colors text-gray-400 whitespace-nowrap">
                            <i class="fas fa-users mr-2"></i>1:1 Documents
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="max-w-7xl mx-auto px-6 py-8">
                <!-- Accounts Tab -->
                <div id="accounts-tab" class="tab-content active">
                    <div class="card rounded-2xl shadow-2xl p-8">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-2xl font-bold text-white mb-1">Accounts</h2>
                                <p class="text-gray-400 text-sm">Manage customer accounts and their notes</p>
                            </div>
                            <button onclick="openAccountModal()" class="btn-primary px-6 py-3 rounded-xl font-semibold transition-all">
                                <i class="fas fa-plus mr-2"></i>New Account
                            </button>
                        </div>
                        <div id="accounts-list" class="space-y-4">
                            <!-- Accounts will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Tasks Tab -->
                <div id="tasks-tab" class="tab-content">
                    <div class="card rounded-2xl shadow-2xl p-8">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-2xl font-bold text-white mb-1">Tasks</h2>
                                <p class="text-gray-400 text-sm">Manage and complete your sales tasks</p>
                            </div>
                            <button onclick="openTaskModal()" class="btn-primary px-6 py-3 rounded-xl font-semibold transition-all">
                                <i class="fas fa-plus mr-2"></i>New Task
                            </button>
                        </div>
                        <div id="tasks-list" class="space-y-4">
                            <!-- Tasks will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Documents Tab -->
                <div id="documents-tab" class="tab-content">
                    <div class="card rounded-2xl shadow-2xl p-8">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-2xl font-bold text-white mb-1">Customer Documents</h2>
                                <p class="text-gray-400 text-sm">Manage proposals, contracts, and presentations</p>
                            </div>
                            <button onclick="openDocumentModal()" class="btn-primary px-6 py-3 rounded-xl font-semibold transition-all">
                                <i class="fas fa-plus mr-2"></i>New Document
                            </button>
                        </div>
                        <div id="documents-list" class="space-y-4">
                            <!-- Documents will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Territory Plans Tab -->
                <div id="plans-tab" class="tab-content">
                    <div class="card rounded-2xl shadow-2xl p-8">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 class="text-2xl font-bold text-white mb-1">Territory Plans</h2>
                                <p class="text-gray-400 text-sm">Manage growth and acquisition strategies</p>
                            </div>
                            <div class="flex flex-wrap items-center gap-3">
                                <div class="flex gap-2">
                                    <button onclick="filterPlans('all')" class="filter-button active px-5 py-2.5 rounded-xl text-sm font-medium transition-all" data-filter="all">
                                        All Plans
                                    </button>
                                    <button onclick="filterPlans('growth')" class="filter-button px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-gray-800 text-gray-300" data-filter="growth">
                                        <i class="fas fa-chart-line mr-1.5"></i>Growth
                                    </button>
                                    <button onclick="filterPlans('acquisition')" class="filter-button px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-gray-800 text-gray-300" data-filter="acquisition">
                                        <i class="fas fa-plus-circle mr-1.5"></i>Acquisition
                                    </button>
                                </div>
                                <button onclick="openPlanModal()" class="btn-primary px-6 py-3 rounded-xl font-semibold transition-all">
                                    <i class="fas fa-plus mr-2"></i>New Plan
                                </button>
                            </div>
                        </div>
                        <div id="plans-list" class="space-y-4">
                            <!-- Plans will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- 1:1 Documents Tab -->
                <div id="oneononedocs-tab" class="tab-content">
                    <div class="card rounded-2xl shadow-2xl p-8">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="text-2xl font-bold text-white mb-1">1:1 Documents</h2>
                                <p class="text-gray-400 text-sm">Track meetings and action items with management</p>
                            </div>
                            <button onclick="openOneOnOneModal()" class="btn-primary px-6 py-3 rounded-xl font-semibold transition-all">
                                <i class="fas fa-plus mr-2"></i>New 1:1
                            </button>
                        </div>
                        <div id="oneononedocs-list" class="space-y-4">
                            <!-- 1:1 docs will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Note Modal -->
        <div id="note-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="note-modal-title">New Account Note</h3>
                        <p class="text-gray-400 text-sm mt-1">Add details about your customer interaction</p>
                    </div>
                    <button onclick="closeNoteModal()" class="text-gray-400 hover:text-white transition-colors p-2">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="note-form" class="space-y-5">
                    <input type="hidden" id="note-id">
                    <div>
                        <label class="block text-sm font-medium mb-2">Account Name</label>
                        <input type="text" id="note-account" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Note Title</label>
                        <input type="text" id="note-title" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Note Content</label>
                        <textarea id="note-content" required rows="5" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeNoteModal()" class="btn-secondary px-6 py-3 rounded-xl font-medium">Cancel</button>
                        <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold">Save Note</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Account Modal -->
        <div id="account-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="account-modal-title">New Account</h3>
                        <p class="text-gray-400 text-sm mt-1">Create a customer account</p>
                    </div>
                    <button onclick="closeAccountModal()" class="text-gray-400 hover:text-white transition-colors p-2">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="account-form" class="space-y-5">
                    <input type="hidden" id="account-id">
                    <div>
                        <label class="block text-sm font-medium mb-2">Account Name</label>
                        <input type="text" id="account-name" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Company Type</label>
                        <select id="account-company-type" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                            <option value="">Select type...</option>
                            <option value="Enterprise">Enterprise</option>
                            <option value="Mid-Market">Mid-Market</option>
                            <option value="SMB">Small Business</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Industry</label>
                        <input type="text" id="account-industry" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all" placeholder="e.g., Technology, Healthcare">
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeAccountModal()" class="btn-secondary px-6 py-3 rounded-xl font-medium">Cancel</button>
                        <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold">Save Account</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Task Modal -->
        <div id="task-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="task-modal-title">New Task</h3>
                        <p class="text-gray-400 text-sm mt-1">Create a task to track</p>
                    </div>
                    <button onclick="closeTaskModal()" class="text-gray-400 hover:text-white transition-colors p-2">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="task-form" class="space-y-5">
                    <input type="hidden" id="task-id">
                    <div>
                        <label class="block text-sm font-medium mb-2">Task Title</label>
                        <input type="text" id="task-title" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Description</label>
                        <textarea id="task-description" rows="3" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Priority</label>
                            <select id="task-priority" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Due Date</label>
                            <input type="date" id="task-due-date" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeTaskModal()" class="btn-secondary px-6 py-3 rounded-xl font-medium">Cancel</button>
                        <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold">Save Task</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Account Notes Modal (for adding notes to an account) -->
        <div id="account-note-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="account-note-modal-title">New Note</h3>
                        <p class="text-gray-400 text-sm mt-1">Add a note to this account</p>
                    </div>
                    <button onclick="closeAccountNoteModal()" class="text-gray-400 hover:text-white transition-colors p-2">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="account-note-form" class="space-y-5">
                    <input type="hidden" id="account-note-account-id">
                    <div>
                        <label class="block text-sm font-medium mb-2">Note Title</label>
                        <input type="text" id="account-note-title" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Note Content</label>
                        <textarea id="account-note-content" required rows="5" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeAccountNoteModal()" class="btn-secondary px-6 py-3 rounded-xl font-medium">Cancel</button>
                        <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold">Save Note</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Document Modal -->
        <div id="document-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="document-modal-title">New Document</h3>
                        <p class="text-gray-400 text-sm mt-1">Store customer-facing documents</p>
                    </div>
                    <button onclick="closeDocumentModal()" class="text-gray-400 hover:text-white transition-colors p-2">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="document-form" class="space-y-5">
                    <input type="hidden" id="document-id">
                    <div>
                        <label class="block text-sm font-medium mb-2">Document Name</label>
                        <input type="text" id="document-name" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Document Type</label>
                        <select id="document-type" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                            <option value="">Select type...</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Contract">Contract</option>
                            <option value="SOW">Statement of Work</option>
                            <option value="Presentation">Presentation</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Account Name (Optional)</label>
                        <input type="text" id="document-account" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Document Content</label>
                        <textarea id="document-content" required rows="5" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeDocumentModal()" class="btn-secondary px-6 py-3 rounded-xl font-medium">Cancel</button>
                        <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold">Save Document</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Plan Modal -->
        <div id="plan-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="plan-modal-title">New Territory Plan</h3>
                        <p class="text-gray-400 text-sm mt-1">Define growth or acquisition strategy</p>
                    </div>
                    <button onclick="closePlanModal()" class="text-gray-400 hover:text-white transition-colors p-2">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="plan-form" class="space-y-5">
                    <input type="hidden" id="plan-id">
                    <div>
                        <label class="block text-sm font-medium mb-2">Plan Name</label>
                        <input type="text" id="plan-name" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Territory Name</label>
                        <input type="text" id="plan-territory" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Account Type</label>
                        <select id="plan-account-type" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                            <option value="growth">Growth (Renewals, Rewrites, Expansions)</option>
                            <option value="acquisition">Acquisition (Net New)</option>
                        </select>
                        <p class="text-xs text-gray-500 mt-2 px-1">
                            <span class="font-medium text-blue-400">Growth:</span> Existing customers (renewals, rewrites, upsells) | 
                            <span class="font-medium text-green-400">Acquisition:</span> Net new prospects
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Status</label>
                        <select id="plan-status" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Plan Content</label>
                        <textarea id="plan-content" required rows="8" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closePlanModal()" class="btn-secondary px-6 py-3 rounded-xl font-medium">Cancel</button>
                        <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold">Save Plan</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 1:1 Modal -->
        <div id="oneonone-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white" id="oneonone-modal-title">New 1:1 Document</h3>
                        <p class="text-gray-400 text-sm mt-1">Record meeting notes and action items</p>
                    </div>
                    <button onclick="closeOneOnOneModal()" class="text-gray-400 hover:text-white transition-colors p-2">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="oneonone-form" class="space-y-5">
                    <input type="hidden" id="oneonone-id">
                    <div>
                        <label class="block text-sm font-medium mb-2">Manager Name</label>
                        <input type="text" id="oneonone-manager" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Meeting Date</label>
                        <input type="date" id="oneonone-date" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Topics</label>
                        <input type="text" id="oneonone-topics" required class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all" placeholder="Comma-separated topics">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Notes</label>
                        <textarea id="oneonone-notes" required rows="5" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Action Items (Optional)</label>
                        <textarea id="oneonone-actions" rows="3" class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeOneOnOneModal()" class="btn-secondary px-6 py-3 rounded-xl font-medium">Cancel</button>
                        <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold">Save Meeting</button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
