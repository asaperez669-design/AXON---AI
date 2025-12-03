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
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            axon: {
                                black: '#000000',
                                yellow: '#FFCC00',
                                'yellow-dark': '#E6B800'
                            }
                        }
                    }
                }
            }
        </script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            body { background-color: #1a1a1a; }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .tab-button.active { 
                background-color: #FFCC00; 
                color: #000000;
                font-weight: 700;
            }
            .tab-button:hover:not(.active) {
                background-color: #333333;
                color: #FFCC00;
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
                background-color: rgba(0,0,0,0.7);
            }
            .modal.active { display: flex; }
            .modal-content {
                background-color: #1a1a1a;
                margin: auto;
                padding: 20px;
                border: 2px solid #FFCC00;
                border-radius: 8px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
            }
            textarea {
                min-height: 100px;
            }
            input, textarea, select {
                background-color: #2a2a2a;
                border-color: #444;
                color: white;
            }
            input:focus, textarea:focus, select:focus {
                border-color: #FFCC00;
                ring-color: #FFCC00;
            }
            label {
                color: #FFCC00;
            }
            .filter-button {
                transition: all 0.2s;
            }
            .filter-button.active {
                background-color: #FFCC00;
                color: #000000;
                font-weight: 600;
            }
        </style>
    </head>
    <body class="bg-gray-900">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-black text-white p-4 shadow-lg border-b-4 border-yellow-400">
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold text-yellow-400">
                        <i class="fas fa-briefcase mr-2"></i>
                        Workflow - Sales Platform
                    </h1>
                    <p class="text-gray-300 mt-1">Streamline your sales operations</p>
                </div>
            </header>

            <!-- Tab Navigation -->
            <div class="bg-black shadow border-b border-gray-700">
                <div class="max-w-7xl mx-auto px-4">
                    <nav class="flex space-x-1 py-2">
                        <button onclick="switchTab('notes')" class="tab-button active px-6 py-3 rounded-t-lg font-medium transition-colors text-black bg-yellow-400">
                            <i class="fas fa-sticky-note mr-2"></i>Account Notes
                        </button>
                        <button onclick="switchTab('documents')" class="tab-button px-6 py-3 rounded-t-lg font-medium transition-colors text-gray-300">
                            <i class="fas fa-file-alt mr-2"></i>Documents
                        </button>
                        <button onclick="switchTab('plans')" class="tab-button px-6 py-3 rounded-t-lg font-medium transition-colors text-gray-300">
                            <i class="fas fa-map mr-2"></i>Territory Plans
                        </button>
                        <button onclick="switchTab('oneononedocs')" class="tab-button px-6 py-3 rounded-t-lg font-medium transition-colors text-gray-300">
                            <i class="fas fa-users mr-2"></i>1:1 Documents
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="max-w-7xl mx-auto p-6">
                <!-- Account Notes Tab -->
                <div id="notes-tab" class="tab-content active">
                    <div class="bg-black rounded-lg shadow-xl border border-yellow-400 p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-yellow-400">Account Notes</h2>
                            <button onclick="openNoteModal()" class="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold transition-colors">
                                <i class="fas fa-plus mr-2"></i>New Note
                            </button>
                        </div>
                        <div id="notes-list" class="space-y-4">
                            <!-- Notes will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Documents Tab -->
                <div id="documents-tab" class="tab-content">
                    <div class="bg-black rounded-lg shadow-xl border border-yellow-400 p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-yellow-400">Customer Documents</h2>
                            <button onclick="openDocumentModal()" class="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold transition-colors">
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
                    <div class="bg-black rounded-lg shadow-xl border border-yellow-400 p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-yellow-400">Territory Plans</h2>
                            <div class="flex items-center space-x-4">
                                <div class="flex space-x-2">
                                    <button onclick="filterPlans('all')" class="filter-button active px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-yellow-400 text-black" data-filter="all">
                                        All Plans
                                    </button>
                                    <button onclick="filterPlans('growth')" class="filter-button px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600" data-filter="growth">
                                        <i class="fas fa-chart-line mr-1"></i>Growth
                                    </button>
                                    <button onclick="filterPlans('acquisition')" class="filter-button px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600" data-filter="acquisition">
                                        <i class="fas fa-plus-circle mr-1"></i>Acquisition
                                    </button>
                                </div>
                                <button onclick="openPlanModal()" class="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold transition-colors">
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
                    <div class="bg-black rounded-lg shadow-xl border border-yellow-400 p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-yellow-400">1:1 Documents</h2>
                            <button onclick="openOneOnOneModal()" class="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold transition-colors">
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
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-yellow-400" id="note-modal-title">New Account Note</h3>
                    <button onclick="closeNoteModal()" class="text-yellow-400 hover:text-yellow-300">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="note-form" class="space-y-4">
                    <input type="hidden" id="note-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Account Name</label>
                        <input type="text" id="note-account" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Note Title</label>
                        <input type="text" id="note-title" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Note Content</label>
                        <textarea id="note-content" required rows="5" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="closeNoteModal()" class="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Document Modal -->
        <div id="document-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-yellow-400" id="document-modal-title">New Document</h3>
                    <button onclick="closeDocumentModal()" class="text-yellow-400 hover:text-yellow-300">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="document-form" class="space-y-4">
                    <input type="hidden" id="document-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Document Name</label>
                        <input type="text" id="document-name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Document Type</label>
                        <select id="document-type" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                            <option value="">Select type...</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Contract">Contract</option>
                            <option value="SOW">Statement of Work</option>
                            <option value="Presentation">Presentation</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Account Name (Optional)</label>
                        <input type="text" id="document-account" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Document Content</label>
                        <textarea id="document-content" required rows="5" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="closeDocumentModal()" class="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Plan Modal -->
        <div id="plan-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-yellow-400" id="plan-modal-title">New Territory Plan</h3>
                    <button onclick="closePlanModal()" class="text-yellow-400 hover:text-yellow-300">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="plan-form" class="space-y-4">
                    <input type="hidden" id="plan-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Plan Name</label>
                        <input type="text" id="plan-name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Territory Name</label>
                        <input type="text" id="plan-territory" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Account Type</label>
                        <select id="plan-account-type" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                            <option value="growth">Growth (Renewals, Rewrites, Expansions)</option>
                            <option value="acquisition">Acquisition (Net New)</option>
                        </select>
                        <p class="text-xs text-gray-400 mt-1">
                            <strong>Growth:</strong> Existing customers (renewals, rewrites, upsells) | 
                            <strong>Acquisition:</strong> Net new prospects
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Status</label>
                        <select id="plan-status" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Plan Content</label>
                        <textarea id="plan-content" required rows="8" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="closePlanModal()" class="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 1:1 Modal -->
        <div id="oneonone-modal" class="modal">
            <div class="modal-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-yellow-400" id="oneonone-modal-title">New 1:1 Document</h3>
                    <button onclick="closeOneOnOneModal()" class="text-yellow-400 hover:text-yellow-300">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="oneonone-form" class="space-y-4">
                    <input type="hidden" id="oneonone-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Manager Name</label>
                        <input type="text" id="oneonone-manager" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Meeting Date</label>
                        <input type="date" id="oneonone-date" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Topics</label>
                        <input type="text" id="oneonone-topics" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400" placeholder="Comma-separated topics">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Notes</label>
                        <textarea id="oneonone-notes" required rows="5" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Action Items (Optional)</label>
                        <textarea id="oneonone-actions" rows="3" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="closeOneOnOneModal()" class="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500">Save</button>
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
