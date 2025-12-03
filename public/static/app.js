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
            <div class="border border-yellow-400 rounded-lg p-4 hover:shadow-xl transition-shadow bg-gray-900">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-yellow-400">${escapeHtml(note.note_title)}</h3>
                        <p class="text-sm text-gray-300 font-medium">
                            <i class="fas fa-building mr-1"></i>${escapeHtml(note.account_name)}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editNote(${note.id})" class="text-yellow-400 hover:text-yellow-300">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteNote(${note.id})" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-300 whitespace-pre-wrap">${escapeHtml(note.note_content)}</p>
                <p class="text-xs text-gray-500 mt-2">
                    <i class="far fa-clock mr-1"></i>Updated: ${formatDate(note.updated_at)}
                </p>
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
            <div class="border border-yellow-400 rounded-lg p-4 hover:shadow-xl transition-shadow bg-gray-900">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-yellow-400">${escapeHtml(doc.document_name)}</h3>
                        <div class="flex items-center space-x-3 mt-1">
                            <span class="text-sm bg-yellow-400 text-black px-2 py-1 rounded font-semibold">
                                ${escapeHtml(doc.document_type)}
                            </span>
                            ${doc.account_name ? `<span class="text-sm text-gray-300">
                                <i class="fas fa-building mr-1"></i>${escapeHtml(doc.account_name)}
                            </span>` : ''}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editDocument(${doc.id})" class="text-yellow-400 hover:text-yellow-300">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteDocument(${doc.id})" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-300 whitespace-pre-wrap">${escapeHtml(doc.document_content)}</p>
                <p class="text-xs text-gray-500 mt-2">
                    <i class="far fa-clock mr-1"></i>Updated: ${formatDate(doc.updated_at)}
                </p>
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
                draft: 'bg-gray-700 text-gray-300',
                active: 'bg-green-600 text-white',
                completed: 'bg-blue-600 text-white'
            };
            
            const accountTypeColors = {
                growth: 'bg-blue-500 text-white',
                acquisition: 'bg-green-500 text-white'
            };
            
            const accountTypeIcons = {
                growth: 'fa-chart-line',
                acquisition: 'fa-plus-circle'
            };
            
            const accountTypeLabels = {
                growth: 'Growth',
                acquisition: 'Acquisition'
            };
            
            return `
                <div class="border border-yellow-400 rounded-lg p-4 hover:shadow-xl transition-shadow bg-gray-900" data-account-type="${plan.account_type}">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <h3 class="font-bold text-lg text-yellow-400">${escapeHtml(plan.plan_name)}</h3>
                            <div class="flex items-center space-x-2 mt-2">
                                <span class="text-sm ${accountTypeColors[plan.account_type]} px-3 py-1 rounded-full font-semibold">
                                    <i class="fas ${accountTypeIcons[plan.account_type]} mr-1"></i>${accountTypeLabels[plan.account_type]}
                                </span>
                                <span class="text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                    <i class="fas fa-map-marker-alt mr-1"></i>${escapeHtml(plan.territory_name)}
                                </span>
                                <span class="text-sm ${statusColors[plan.status]} px-2 py-1 rounded capitalize font-medium">
                                    ${escapeHtml(plan.status)}
                                </span>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="editPlan(${plan.id})" class="text-yellow-400 hover:text-yellow-300">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deletePlan(${plan.id})" class="text-red-400 hover:text-red-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-gray-300 whitespace-pre-wrap mt-3">${escapeHtml(plan.plan_content)}</p>
                    <p class="text-xs text-gray-500 mt-2">
                        <i class="far fa-clock mr-1"></i>Updated: ${formatDate(plan.updated_at)}
                    </p>
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
        btn.classList.remove('active', 'bg-yellow-400', 'text-black', 'font-semibold');
        btn.classList.add('bg-gray-700', 'text-gray-300');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-yellow-400', 'text-black', 'font-semibold');
        activeBtn.classList.remove('bg-gray-700', 'text-gray-300');
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
            <div class="border border-yellow-400 rounded-lg p-4 hover:shadow-xl transition-shadow bg-gray-900">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-yellow-400">
                            <i class="fas fa-user-tie mr-2"></i>${escapeHtml(doc.manager_name)}
                        </h3>
                        <div class="flex items-center space-x-3 mt-1">
                            <span class="text-sm bg-yellow-400 text-black px-2 py-1 rounded font-semibold">
                                <i class="far fa-calendar mr-1"></i>${formatDate(doc.meeting_date)}
                            </span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editOneOnOne(${doc.id})" class="text-yellow-400 hover:text-yellow-300">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteOneOnOne(${doc.id})" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="space-y-2">
                    <div>
                        <p class="text-sm font-semibold text-yellow-400">Topics:</p>
                        <p class="text-gray-300">${escapeHtml(doc.topics)}</p>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-yellow-400">Notes:</p>
                        <p class="text-gray-300 whitespace-pre-wrap">${escapeHtml(doc.notes)}</p>
                    </div>
                    ${doc.action_items ? `
                        <div>
                            <p class="text-sm font-semibold text-yellow-400">Action Items:</p>
                            <p class="text-gray-300 whitespace-pre-wrap">${escapeHtml(doc.action_items)}</p>
                        </div>
                    ` : ''}
                </div>
                <p class="text-xs text-gray-500 mt-2">
                    <i class="far fa-clock mr-1"></i>Updated: ${formatDate(doc.updated_at)}
                </p>
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

// Initialize - Load notes by default
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});
