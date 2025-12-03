// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.closest('.tab-button').classList.add('active');
    
    // Load data for the selected tab
    loadTabData(tabName);
}

// Load data based on current tab
function loadTabData(tabName) {
    switch(tabName) {
        case 'accounts':
            loadAccounts();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'notes':
            loadNotes();
            break;
        case 'documents':
            loadDocuments();
            break;
        case 'plans':
            loadPlans();
            break;
        case 'oneononedocs':
            loadOneOnOneDocs();
            break;
    }
}

// ============ Accounts Functions ============
let currentAccountId = null;
let allAccountsData = []; // Store all accounts and their notes for search

async function loadAccounts() {
    try {
        const response = await axios.get('/api/accounts');
        const accounts = response.data.data || [];
        
        // Load all notes for search functionality
        const notesPromises = accounts.map(account => 
            axios.get(`/api/accounts/${account.id}/notes`)
                .then(res => ({ accountId: account.id, notes: res.data.data || [] }))
                .catch(() => ({ accountId: account.id, notes: [] }))
        );
        const notesData = await Promise.all(notesPromises);
        
        // Store accounts with their notes for search
        allAccountsData = accounts.map(account => {
            const accountNotes = notesData.find(n => n.accountId === account.id)?.notes || [];
            return { ...account, notes: accountNotes };
        });
        
        displayAccounts(allAccountsData);
    } catch (error) {
        console.error('Error loading accounts:', error);
        showError('Failed to load accounts');
    }
}

function displayAccounts(accounts) {
    const accountsList = document.getElementById('accounts-list');
    
    if (accounts.length === 0) {
        const searchTerm = document.getElementById('account-search')?.value;
        if (searchTerm) {
            accountsList.innerHTML = '<p class="text-gray-400 text-center py-8">No accounts found matching your search.</p>';
        } else {
            accountsList.innerHTML = '<p class="text-gray-400 text-center py-8">No accounts yet. Create your first account!</p>';
        }
        return;
    }
    
    accountsList.innerHTML = accounts.map(account => {
        const noteCount = account.notes ? account.notes.length : 0;
        return `
            <div class="card rounded-xl p-6 hover:shadow-2xl transition-all cursor-pointer" onclick="viewAccountDetails(${account.id})">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg text-white mb-2">${escapeHtml(account.account_name)}</h3>
                        <div class="flex items-center gap-2 flex-wrap">
                            ${account.company_type ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                ${escapeHtml(account.company_type)}
                            </span>` : ''}
                            ${account.industry ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                ${escapeHtml(account.industry)}
                            </span>` : ''}
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                <i class="fas fa-check-circle mr-1"></i>${escapeHtml(account.status)}
                            </span>
                            ${noteCount > 0 ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                <i class="fas fa-sticky-note mr-1"></i>${noteCount} note${noteCount !== 1 ? 's' : ''}
                            </span>` : ''}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="event.stopPropagation(); editAccount(${account.id})" class="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deleteAccount(${account.id})" class="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-800">
                    <p class="text-xs text-gray-500 flex items-center">
                        <i class="far fa-clock mr-1.5"></i>Created ${formatDate(account.created_at)}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

async function viewAccountDetails(accountId) {
    currentAccountId = accountId;
    
    try {
        const [accountResponse, notesResponse] = await Promise.all([
            axios.get(`/api/accounts/${accountId}`),
            axios.get(`/api/accounts/${accountId}/notes`)
        ]);
        
        const account = accountResponse.data.data;
        const notes = notesResponse.data.data || [];
        
        const accountsList = document.getElementById('accounts-list');
        accountsList.innerHTML = `
            <div class="mb-6">
                <button onclick="loadAccounts()" class="text-gray-400 hover:text-yellow-400 transition-colors mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Accounts
                </button>
                <div class="card rounded-xl p-8">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h3 class="text-3xl font-bold text-white mb-3">${escapeHtml(account.account_name)}</h3>
                            <div class="flex items-center gap-2 flex-wrap">
                                ${account.company_type ? `<span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    ${escapeHtml(account.company_type)}
                                </span>` : ''}
                                ${account.industry ? `<span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    ${escapeHtml(account.industry)}
                                </span>` : ''}
                            </div>
                        </div>
                        <button onclick="openAccountNoteModal(${accountId})" class="btn-primary px-6 py-3 rounded-xl font-semibold transition-all">
                            <i class="fas fa-plus mr-2"></i>Add Note
                        </button>
                    </div>
                    
                    <div class="mt-8">
                        <h4 class="text-xl font-semibold text-white mb-4">Notes</h4>
                        <div class="space-y-4">
                            ${notes.length === 0 ? '<p class="text-gray-400 text-center py-8">No notes yet. Add your first note!</p>' : notes.map(note => `
                                <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                    <div class="flex justify-between items-start mb-3">
                                        <h5 class="font-semibold text-lg text-white">${escapeHtml(note.note_title)}</h5>
                                        <span class="text-xs text-gray-500">${formatDate(note.created_at)}</span>
                                    </div>
                                    <p class="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">${escapeHtml(note.note_content)}</p>
                                    
                                    ${note.budget || note.authority || note.need || note.timeline ? `
                                        <div class="border-t border-gray-700 pt-4 mt-4">
                                            <h6 class="text-sm font-semibold text-yellow-400 mb-3 flex items-center">
                                                <i class="fas fa-chart-line mr-2"></i>BANT Qualification
                                            </h6>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                ${note.budget ? `
                                                    <div>
                                                        <span class="font-medium text-gray-400">Budget:</span>
                                                        <p class="text-gray-300 mt-1">${escapeHtml(note.budget)}</p>
                                                    </div>
                                                ` : ''}
                                                ${note.authority ? `
                                                    <div>
                                                        <span class="font-medium text-gray-400">Authority:</span>
                                                        <p class="text-gray-300 mt-1">${escapeHtml(note.authority)}</p>
                                                    </div>
                                                ` : ''}
                                                ${note.need ? `
                                                    <div>
                                                        <span class="font-medium text-gray-400">Need:</span>
                                                        <p class="text-gray-300 mt-1">${escapeHtml(note.need)}</p>
                                                    </div>
                                                ` : ''}
                                                ${note.timeline ? `
                                                    <div>
                                                        <span class="font-medium text-gray-400">Timeline:</span>
                                                        <p class="text-gray-300 mt-1">${escapeHtml(note.timeline)}</p>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    ${note.risk || note.risk_level ? `
                                        <div class="border-t border-gray-700 pt-4 mt-4">
                                            <h6 class="text-sm font-semibold text-yellow-400 mb-3 flex items-center">
                                                <i class="fas fa-exclamation-triangle mr-2"></i>Risk Assessment
                                                ${note.risk_level ? `
                                                    <span class="ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                                        note.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                                                        note.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }">${note.risk_level.toUpperCase()} RISK</span>
                                                ` : ''}
                                            </h6>
                                            ${note.risk ? `<p class="text-gray-300 text-sm">${escapeHtml(note.risk)}</p>` : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading account details:', error);
        showError('Failed to load account details');
    }
}

function openAccountModal(accountId = null) {
    const modal = document.getElementById('account-modal');
    const form = document.getElementById('account-form');
    const title = document.getElementById('account-modal-title');
    
    form.reset();
    document.getElementById('account-id').value = '';
    
    if (accountId) {
        title.textContent = 'Edit Account';
        loadAccountForEdit(accountId);
    } else {
        title.textContent = 'New Account';
    }
    
    modal.classList.add('active');
}

function closeAccountModal() {
    document.getElementById('account-modal').classList.remove('active');
}

async function loadAccountForEdit(id) {
    try {
        const response = await axios.get(`/api/accounts/${id}`);
        const account = response.data.data;
        
        document.getElementById('account-id').value = account.id;
        document.getElementById('account-name').value = account.account_name;
        document.getElementById('account-company-type').value = account.company_type || '';
        document.getElementById('account-industry').value = account.industry || '';
    } catch (error) {
        console.error('Error loading account:', error);
        showError('Failed to load account');
    }
}

function editAccount(id) {
    openAccountModal(id);
}

async function deleteAccount(id) {
    if (!confirm('Are you sure you want to delete this account? All associated notes will also be deleted.')) return;
    
    try {
        await axios.delete(`/api/accounts/${id}`);
        loadAccounts();
        showSuccess('Account deleted successfully');
    } catch (error) {
        console.error('Error deleting account:', error);
        showError('Failed to delete account');
    }
}

document.getElementById('account-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('account-id').value;
    const data = {
        account_name: document.getElementById('account-name').value,
        company_type: document.getElementById('account-company-type').value,
        industry: document.getElementById('account-industry').value,
        status: 'active'
    };
    
    try {
        if (id) {
            await axios.put(`/api/accounts/${id}`, data);
            showSuccess('Account updated successfully');
        } else {
            await axios.post('/api/accounts', data);
            showSuccess('Account created successfully');
        }
        
        closeAccountModal();
        loadAccounts();
    } catch (error) {
        console.error('Error saving account:', error);
        showError('Failed to save account');
    }
});

// Account Note Modal Functions
function openAccountNoteModal(accountId) {
    currentAccountId = accountId;
    const modal = document.getElementById('account-note-modal');
    const form = document.getElementById('account-note-form');
    
    form.reset();
    document.getElementById('account-note-account-id').value = accountId;
    
    modal.classList.add('active');
}

function closeAccountNoteModal() {
    document.getElementById('account-note-modal').classList.remove('active');
}

document.getElementById('account-note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const accountId = document.getElementById('account-note-account-id').value;
    const data = {
        note_title: document.getElementById('account-note-title').value,
        note_content: document.getElementById('account-note-content').value,
        budget: document.getElementById('account-note-budget').value,
        authority: document.getElementById('account-note-authority').value,
        need: document.getElementById('account-note-need').value,
        timeline: document.getElementById('account-note-timeline').value,
        risk: document.getElementById('account-note-risk').value,
        risk_level: document.getElementById('account-note-risk-level').value
    };
    
    try {
        await axios.post(`/api/accounts/${accountId}/notes`, data);
        showSuccess('Note added successfully');
        closeAccountNoteModal();
        viewAccountDetails(accountId);
    } catch (error) {
        console.error('Error saving note:', error);
        showError('Failed to save note');
    }
});

// ============ Tasks Functions ============
async function loadTasks() {
    try {
        const response = await axios.get('/api/tasks');
        const tasks = response.data.data || [];
        
        const tasksList = document.getElementById('tasks-list');
        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-400 text-center py-8">No tasks yet. Create your first task!</p>';
            return;
        }
        
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const completedTasks = tasks.filter(t => t.status === 'completed');
        
        tasksList.innerHTML = `
            ${pendingTasks.length > 0 ? `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-list-check mr-2 text-yellow-400"></i>
                        Pending Tasks (${pendingTasks.length})
                    </h3>
                    <div class="space-y-3">
                        ${pendingTasks.map(task => renderTask(task)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${completedTasks.length > 0 ? `
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-check-circle mr-2 text-green-400"></i>
                        Completed Tasks (${completedTasks.length})
                    </h3>
                    <div class="space-y-3">
                        ${completedTasks.map(task => renderTask(task)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks');
    }
}

function renderTask(task) {
    const priorityColors = {
        low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    const isCompleted = task.status === 'completed';
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
    
    return `
        <div class="card rounded-xl p-5 hover:shadow-2xl transition-all ${isCompleted ? 'opacity-60' : ''}">
            <div class="flex items-start gap-4">
                <button onclick="toggleTaskComplete(${task.id})" class="mt-1 flex-shrink-0">
                    <div class="w-6 h-6 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-yellow-400'} flex items-center justify-center transition-colors">
                        ${isCompleted ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                    </div>
                </button>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <h4 class="font-semibold text-white ${isCompleted ? 'line-through' : ''}">${escapeHtml(task.task_title)}</h4>
                            ${task.task_description ? `<p class="text-gray-400 text-sm mt-1">${escapeHtml(task.task_description)}</p>` : ''}
                        </div>
                        <div class="flex space-x-2 ml-4">
                            <button onclick="editTask(${task.id})" class="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteTask(${task.id})" class="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap mt-3">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]} border capitalize">
                            ${task.priority} priority
                        </span>
                        ${task.due_date ? `
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isOverdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700 text-gray-300 border border-gray-600'}">
                                <i class="far fa-calendar mr-1.5"></i>${formatDate(task.due_date)}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function toggleTaskComplete(id) {
    try {
        await axios.patch(`/api/tasks/${id}/toggle`);
        loadTasks();
    } catch (error) {
        console.error('Error toggling task:', error);
        showError('Failed to update task');
    }
}

function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const title = document.getElementById('task-modal-title');
    
    form.reset();
    document.getElementById('task-id').value = '';
    
    if (taskId) {
        title.textContent = 'Edit Task';
        loadTaskForEdit(taskId);
    } else {
        title.textContent = 'New Task';
    }
    
    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
}

async function loadTaskForEdit(id) {
    try {
        const response = await axios.get(`/api/tasks/${id}`);
        const task = response.data.data;
        
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.task_title;
        document.getElementById('task-description').value = task.task_description || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-due-date').value = task.due_date || '';
    } catch (error) {
        console.error('Error loading task:', error);
        showError('Failed to load task');
    }
}

function editTask(id) {
    openTaskModal(id);
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        await axios.delete(`/api/tasks/${id}`);
        loadTasks();
        showSuccess('Task deleted successfully');
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task');
    }
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('task-id').value;
    const data = {
        task_title: document.getElementById('task-title').value,
        task_description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        due_date: document.getElementById('task-due-date').value || null,
        status: 'pending'
    };
    
    try {
        if (id) {
            await axios.put(`/api/tasks/${id}`, data);
            showSuccess('Task updated successfully');
        } else {
            await axios.post('/api/tasks', data);
            showSuccess('Task created successfully');
        }
        
        closeTaskModal();
        loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        showError('Failed to save task');
    }
});

// ============ Account Notes Functions ============
async function loadNotes() {
    try {
        const response = await axios.get('/api/notes');
        const notes = response.data.data || [];
        
        const notesList = document.getElementById('notes-list');
        if (notes.length === 0) {
            notesList.innerHTML = '<p class="text-gray-400 text-center py-8">No notes yet. Create your first note!</p>';
            return;
        }
        
        notesList.innerHTML = notes.map(note => `
            <div class="card rounded-xl p-6 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg text-white mb-2">${escapeHtml(note.note_title)}</h3>
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                                <i class="fas fa-building mr-1.5"></i>${escapeHtml(note.account_name)}
                            </span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editNote(${note.id})" class="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteNote(${note.id})" class="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(note.note_content)}</p>
                <div class="mt-4 pt-4 border-t border-gray-800">
                    <p class="text-xs text-gray-500 flex items-center">
                        <i class="far fa-clock mr-1.5"></i>Updated ${formatDate(note.updated_at)}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading notes:', error);
        showError('Failed to load notes');
    }
}

function openNoteModal(noteId = null) {
    const modal = document.getElementById('note-modal');
    const form = document.getElementById('note-form');
    const title = document.getElementById('note-modal-title');
    
    form.reset();
    document.getElementById('note-id').value = '';
    
    if (noteId) {
        title.textContent = 'Edit Account Note';
        loadNoteForEdit(noteId);
    } else {
        title.textContent = 'New Account Note';
    }
    
    modal.classList.add('active');
}

function closeNoteModal() {
    document.getElementById('note-modal').classList.remove('active');
}

async function loadNoteForEdit(id) {
    try {
        const response = await axios.get(`/api/notes/${id}`);
        const note = response.data.data;
        
        document.getElementById('note-id').value = note.id;
        document.getElementById('note-account').value = note.account_name;
        document.getElementById('note-title').value = note.note_title;
        document.getElementById('note-content').value = note.note_content;
    } catch (error) {
        console.error('Error loading note:', error);
        showError('Failed to load note');
    }
}

function editNote(id) {
    openNoteModal(id);
}

async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        await axios.delete(`/api/notes/${id}`);
        loadNotes();
        showSuccess('Note deleted successfully');
    } catch (error) {
        console.error('Error deleting note:', error);
        showError('Failed to delete note');
    }
}

document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('note-id').value;
    const data = {
        account_name: document.getElementById('note-account').value,
        note_title: document.getElementById('note-title').value,
        note_content: document.getElementById('note-content').value
    };
    
    try {
        if (id) {
            await axios.put(`/api/notes/${id}`, data);
            showSuccess('Note updated successfully');
        } else {
            await axios.post('/api/notes', data);
            showSuccess('Note created successfully');
        }
        
        closeNoteModal();
        loadNotes();
    } catch (error) {
        console.error('Error saving note:', error);
        showError('Failed to save note');
    }
});

// ============ Documents Functions ============
async function loadDocuments() {
    try {
        const response = await axios.get('/api/documents');
        const documents = response.data.data || [];
        
        const documentsList = document.getElementById('documents-list');
        if (documents.length === 0) {
            documentsList.innerHTML = '<p class="text-gray-400 text-center py-8">No documents yet. Upload your first document!</p>';
            return;
        }
        
        documentsList.innerHTML = documents.map(doc => `
            <div class="card rounded-xl p-6 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg text-white mb-2">${escapeHtml(doc.document_name)}</h3>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-300 text-black">
                                ${escapeHtml(doc.document_type)}
                            </span>
                            ${doc.account_name ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                <i class="fas fa-building mr-1.5"></i>${escapeHtml(doc.account_name)}
                            </span>` : ''}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editDocument(${doc.id})" class="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteDocument(${doc.id})" class="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(doc.document_content)}</p>
                <div class="mt-4 pt-4 border-t border-gray-800">
                    <p class="text-xs text-gray-500 flex items-center">
                        <i class="far fa-clock mr-1.5"></i>Updated ${formatDate(doc.updated_at)}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading documents:', error);
        showError('Failed to load documents');
    }
}

function openDocumentModal(documentId = null) {
    const modal = document.getElementById('document-modal');
    const form = document.getElementById('document-form');
    const title = document.getElementById('document-modal-title');
    
    form.reset();
    document.getElementById('document-id').value = '';
    
    if (documentId) {
        title.textContent = 'Edit Document';
        loadDocumentForEdit(documentId);
    } else {
        title.textContent = 'New Document';
    }
    
    modal.classList.add('active');
}

function closeDocumentModal() {
    document.getElementById('document-modal').classList.remove('active');
}

async function loadDocumentForEdit(id) {
    try {
        const response = await axios.get(`/api/documents/${id}`);
        const doc = response.data.data;
        
        document.getElementById('document-id').value = doc.id;
        document.getElementById('document-name').value = doc.document_name;
        document.getElementById('document-type').value = doc.document_type;
        document.getElementById('document-account').value = doc.account_name || '';
        document.getElementById('document-content').value = doc.document_content;
    } catch (error) {
        console.error('Error loading document:', error);
        showError('Failed to load document');
    }
}

function editDocument(id) {
    openDocumentModal(id);
}

async function deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
        await axios.delete(`/api/documents/${id}`);
        loadDocuments();
        showSuccess('Document deleted successfully');
    } catch (error) {
        console.error('Error deleting document:', error);
        showError('Failed to delete document');
    }
}

document.getElementById('document-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('document-id').value;
    const data = {
        document_name: document.getElementById('document-name').value,
        document_type: document.getElementById('document-type').value,
        document_account: document.getElementById('document-account').value,
        document_content: document.getElementById('document-content').value
    };
    
    try {
        if (id) {
            await axios.put(`/api/documents/${id}`, data);
            showSuccess('Document updated successfully');
        } else {
            await axios.post('/api/documents', data);
            showSuccess('Document created successfully');
        }
        
        closeDocumentModal();
        loadDocuments();
    } catch (error) {
        console.error('Error saving document:', error);
        showError('Failed to save document');
    }
});

// ============ Territory Plans Functions ============
let currentFilter = 'all';

async function loadPlans(filter = currentFilter) {
    try {
        const response = await axios.get('/api/plans');
        let plans = response.data.data || [];
        
        // Filter plans by account type
        if (filter !== 'all') {
            plans = plans.filter(p => p.account_type === filter);
        }
        
        const plansList = document.getElementById('plans-list');
        if (plans.length === 0) {
            plansList.innerHTML = '<p class="text-gray-400 text-center py-8">No territory plans yet. Create your first plan!</p>';
            return;
        }
        
        plansList.innerHTML = plans.map(plan => {
            const statusColors = {
                draft: 'bg-gray-700/50 text-gray-300 border border-gray-600',
                active: 'bg-green-500/20 text-green-400 border border-green-500/30',
                completed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            };
            
            const accountTypeStyles = {
                growth: {
                    bg: 'bg-gradient-to-r from-blue-500 to-blue-400',
                    border: 'border-blue-400/30',
                    text: 'text-white'
                },
                acquisition: {
                    bg: 'bg-gradient-to-r from-green-500 to-emerald-400',
                    border: 'border-green-400/30',
                    text: 'text-white'
                }
            };
            
            const accountTypeIcons = {
                growth: 'fa-chart-line',
                acquisition: 'fa-plus-circle'
            };
            
            const accountTypeLabels = {
                growth: 'Growth',
                acquisition: 'Acquisition'
            };
            
            const style = accountTypeStyles[plan.account_type];
            
            return `
                <div class="card rounded-xl p-6 hover:shadow-2xl transition-all" data-account-type="${plan.account_type}">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg text-white mb-3">${escapeHtml(plan.plan_name)}</h3>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${style.bg} ${style.text} shadow-lg">
                                    <i class="fas ${accountTypeIcons[plan.account_type]} mr-2"></i>${accountTypeLabels[plan.account_type]}
                                </span>
                                <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                    <i class="fas fa-map-marker-alt mr-1.5"></i>${escapeHtml(plan.territory_name)}
                                </span>
                                <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${statusColors[plan.status]} capitalize">
                                    ${escapeHtml(plan.status)}
                                </span>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="editPlan(${plan.id})" class="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deletePlan(${plan.id})" class="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-gray-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(plan.plan_content)}</p>
                    <div class="mt-4 pt-4 border-t border-gray-800">
                        <p class="text-xs text-gray-500 flex items-center">
                            <i class="far fa-clock mr-1.5"></i>Updated ${formatDate(plan.updated_at)}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading plans:', error);
        showError('Failed to load territory plans');
    }
}

function filterPlans(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.color = '';
        btn.classList.add('bg-gray-800', 'text-gray-300');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.classList.remove('bg-gray-800', 'text-gray-300');
    }
    
    loadPlans(filter);
}

function openPlanModal(planId = null) {
    const modal = document.getElementById('plan-modal');
    const form = document.getElementById('plan-form');
    const title = document.getElementById('plan-modal-title');
    
    form.reset();
    document.getElementById('plan-id').value = '';
    
    if (planId) {
        title.textContent = 'Edit Territory Plan';
        loadPlanForEdit(planId);
    } else {
        title.textContent = 'New Territory Plan';
    }
    
    modal.classList.add('active');
}

function closePlanModal() {
    document.getElementById('plan-modal').classList.remove('active');
}

async function loadPlanForEdit(id) {
    try {
        const response = await axios.get(`/api/plans/${id}`);
        const plan = response.data.data;
        
        document.getElementById('plan-id').value = plan.id;
        document.getElementById('plan-name').value = plan.plan_name;
        document.getElementById('plan-territory').value = plan.territory_name;
        document.getElementById('plan-account-type').value = plan.account_type || 'growth';
        document.getElementById('plan-status').value = plan.status;
        document.getElementById('plan-content').value = plan.plan_content;
    } catch (error) {
        console.error('Error loading plan:', error);
        showError('Failed to load plan');
    }
}

function editPlan(id) {
    openPlanModal(id);
}

async function deletePlan(id) {
    if (!confirm('Are you sure you want to delete this territory plan?')) return;
    
    try {
        await axios.delete(`/api/plans/${id}`);
        loadPlans();
        showSuccess('Territory plan deleted successfully');
    } catch (error) {
        console.error('Error deleting plan:', error);
        showError('Failed to delete territory plan');
    }
}

document.getElementById('plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('plan-id').value;
    const data = {
        plan_name: document.getElementById('plan-name').value,
        territory_name: document.getElementById('plan-territory').value,
        plan_content: document.getElementById('plan-content').value,
        status: document.getElementById('plan-status').value,
        account_type: document.getElementById('plan-account-type').value
    };
    
    try {
        if (id) {
            await axios.put(`/api/plans/${id}`, data);
            showSuccess('Territory plan updated successfully');
        } else {
            await axios.post('/api/plans', data);
            showSuccess('Territory plan created successfully');
        }
        
        closePlanModal();
        loadPlans();
    } catch (error) {
        console.error('Error saving plan:', error);
        showError('Failed to save territory plan');
    }
});

// ============ 1:1 Documents Functions ============
async function loadOneOnOneDocs() {
    try {
        const response = await axios.get('/api/oneononedocs');
        const docs = response.data.data || [];
        
        const docsList = document.getElementById('oneononedocs-list');
        if (docs.length === 0) {
            docsList.innerHTML = '<p class="text-gray-400 text-center py-8">No 1:1 documents yet. Create your first meeting note!</p>';
            return;
        }
        
        docsList.innerHTML = docs.map(doc => `
            <div class="card rounded-xl p-6 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-300 flex items-center justify-center mr-4">
                                <i class="fas fa-user-tie text-black text-lg"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-lg text-white">${escapeHtml(doc.manager_name)}</h3>
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 mt-1">
                                    <i class="far fa-calendar mr-1.5"></i>${formatDate(doc.meeting_date)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editOneOnOne(${doc.id})" class="text-gray-400 hover:text-yellow-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteOneOnOne(${doc.id})" class="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="space-y-4">
                    <div>
                        <p class="text-sm font-medium text-gray-400 mb-2">Topics</p>
                        <p class="text-gray-300 leading-relaxed">${escapeHtml(doc.topics)}</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-400 mb-2">Notes</p>
                        <p class="text-gray-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(doc.notes)}</p>
                    </div>
                    ${doc.action_items ? `
                        <div class="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4">
                            <p class="text-sm font-medium text-yellow-400 mb-2 flex items-center">
                                <i class="fas fa-tasks mr-2"></i>Action Items
                            </p>
                            <p class="text-gray-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(doc.action_items)}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="mt-4 pt-4 border-t border-gray-800">
                    <p class="text-xs text-gray-500 flex items-center">
                        <i class="far fa-clock mr-1.5"></i>Updated ${formatDate(doc.updated_at)}
                    </p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading 1:1 docs:', error);
        showError('Failed to load 1:1 documents');
    }
}

function openOneOnOneModal(docId = null) {
    const modal = document.getElementById('oneonone-modal');
    const form = document.getElementById('oneonone-form');
    const title = document.getElementById('oneonone-modal-title');
    
    form.reset();
    document.getElementById('oneonone-id').value = '';
    
    if (docId) {
        title.textContent = 'Edit 1:1 Document';
        loadOneOnOneForEdit(docId);
    } else {
        title.textContent = 'New 1:1 Document';
        // Set today's date as default
        document.getElementById('oneonone-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
}

function closeOneOnOneModal() {
    document.getElementById('oneonone-modal').classList.remove('active');
}

async function loadOneOnOneForEdit(id) {
    try {
        const response = await axios.get(`/api/oneononedocs/${id}`);
        const doc = response.data.data;
        
        document.getElementById('oneonone-id').value = doc.id;
        document.getElementById('oneonone-manager').value = doc.manager_name;
        document.getElementById('oneonone-date').value = doc.meeting_date;
        document.getElementById('oneonone-topics').value = doc.topics;
        document.getElementById('oneonone-notes').value = doc.notes;
        document.getElementById('oneonone-actions').value = doc.action_items || '';
    } catch (error) {
        console.error('Error loading 1:1 doc:', error);
        showError('Failed to load 1:1 document');
    }
}

function editOneOnOne(id) {
    openOneOnOneModal(id);
}

async function deleteOneOnOne(id) {
    if (!confirm('Are you sure you want to delete this 1:1 document?')) return;
    
    try {
        await axios.delete(`/api/oneononedocs/${id}`);
        loadOneOnOneDocs();
        showSuccess('1:1 document deleted successfully');
    } catch (error) {
        console.error('Error deleting 1:1 doc:', error);
        showError('Failed to delete 1:1 document');
    }
}

document.getElementById('oneonone-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('oneonone-id').value;
    const data = {
        manager_name: document.getElementById('oneonone-manager').value,
        meeting_date: document.getElementById('oneonone-date').value,
        topics: document.getElementById('oneonone-topics').value,
        notes: document.getElementById('oneonone-notes').value,
        action_items: document.getElementById('oneonone-actions').value
    };
    
    try {
        if (id) {
            await axios.put(`/api/oneononedocs/${id}`, data);
            showSuccess('1:1 document updated successfully');
        } else {
            await axios.post('/api/oneononedocs', data);
            showSuccess('1:1 document created successfully');
        }
        
        closeOneOnOneModal();
        loadOneOnOneDocs();
    } catch (error) {
        console.error('Error saving 1:1 doc:', error);
        showError('Failed to save 1:1 document');
    }
});

// ============ Utility Functions ============
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    // Simple success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-xl z-50 font-semibold border-2 border-black';
    notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    // Simple error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 font-semibold border-2 border-black';
    notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============ AI BANT Extraction Functions ============
async function extractBANTFromTranscript() {
    const transcript = document.getElementById('account-note-transcript')?.value?.trim();
    
    if (!transcript) {
        showError('Please paste a transcript first');
        return;
    }
    
    const btn = document.getElementById('ai-extract-btn');
    const btnText = document.getElementById('ai-extract-text');
    const loader = document.getElementById('ai-extract-loader');
    
    // Show loading state
    btn.disabled = true;
    btnText.textContent = 'Analyzing with AI...';
    loader.classList.remove('hidden');
    
    try {
        const response = await axios.post('/api/extract-bant', {
            transcript: transcript
        });
        
        if (response.data.success) {
            const bantData = response.data.data;
            
            // Fill in the BANT fields
            if (bantData.budget) {
                document.getElementById('account-note-budget').value = bantData.budget;
            }
            if (bantData.authority) {
                document.getElementById('account-note-authority').value = bantData.authority;
            }
            if (bantData.need) {
                document.getElementById('account-note-need').value = bantData.need;
            }
            if (bantData.timeline) {
                document.getElementById('account-note-timeline').value = bantData.timeline;
            }
            if (bantData.risk) {
                document.getElementById('account-note-risk').value = bantData.risk;
            }
            if (bantData.risk_level) {
                document.getElementById('account-note-risk-level').value = bantData.risk_level;
            }
            
            showSuccess('BANT fields auto-filled successfully! Review and adjust as needed.');
            
            // Scroll to BANT section
            setTimeout(() => {
                document.getElementById('account-note-budget')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 500);
            
        } else {
            if (response.data.needsConfig) {
                showError('⚠️ OpenAI API not configured. Please set up your API key in GenSpark settings under the API Keys tab.');
            } else {
                showError(response.data.error || 'Failed to extract BANT information');
            }
        }
        
    } catch (error) {
        console.error('Error extracting BANT:', error);
        if (error.response?.data?.needsConfig) {
            showError('⚠️ OpenAI API not configured. Please set up your API key in GenSpark settings under the API Keys tab.');
        } else if (error.response?.data?.error) {
            showError(error.response.data.error);
        } else {
            showError('Failed to extract BANT information. Please try again.');
        }
    } finally {
        // Reset button state
        btn.disabled = false;
        btnText.textContent = 'Auto-Fill BANT Fields with AI';
        loader.classList.add('hidden');
    }
}

// ============ Search Functions ============
function searchAccounts() {
    const searchTerm = document.getElementById('account-search').value.toLowerCase().trim();
    const clearBtn = document.getElementById('clear-search');
    const resultsCount = document.getElementById('search-results-count');
    
    // Show/hide clear button
    if (searchTerm) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
        resultsCount.classList.add('hidden');
        displayAccounts(allAccountsData);
        return;
    }
    
    // Search through accounts and their notes
    const filteredAccounts = allAccountsData.filter(account => {
        // Search in account name
        if (account.account_name.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in company type
        if (account.company_type && account.company_type.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in industry
        if (account.industry && account.industry.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in notes
        if (account.notes && account.notes.length > 0) {
            return account.notes.some(note => {
                // Search in note title
                if (note.note_title && note.note_title.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                // Search in note content
                if (note.note_content && note.note_content.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                // Search in BANT fields
                if (note.budget && note.budget.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                if (note.authority && note.authority.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                if (note.need && note.need.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                if (note.timeline && note.timeline.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                // Search in risk fields
                if (note.risk && note.risk.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                if (note.risk_level && note.risk_level.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                return false;
            });
        }
        
        return false;
    });
    
    // Show results count
    resultsCount.classList.remove('hidden');
    if (filteredAccounts.length === 1) {
        resultsCount.innerHTML = `<i class="fas fa-search mr-1"></i>Found 1 account matching "<span class="text-yellow-400 font-medium">${escapeHtml(searchTerm)}</span>"`;
    } else {
        resultsCount.innerHTML = `<i class="fas fa-search mr-1"></i>Found ${filteredAccounts.length} accounts matching "<span class="text-yellow-400 font-medium">${escapeHtml(searchTerm)}</span>"`;
    }
    
    displayAccounts(filteredAccounts);
}

function clearSearch() {
    document.getElementById('account-search').value = '';
    document.getElementById('clear-search').classList.add('hidden');
    document.getElementById('search-results-count').classList.add('hidden');
    displayAccounts(allAccountsData);
}

// ============ Theme Toggle Functions ============
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (body.classList.contains('light-mode')) {
        // Switch to dark mode
        body.classList.remove('light-mode');
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark';
        localStorage.setItem('theme', 'dark');
    } else {
        // Switch to light mode
        body.classList.add('light-mode');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light';
        localStorage.setItem('theme', 'light');
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light';
    } else {
        body.classList.remove('light-mode');
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark';
    }
}

// Initialize - Load accounts by default and set theme
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadAccounts();
});
