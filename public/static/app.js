// TaskBoard Frontend Application
class TaskBoardApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.currentBoard = null;
        this.currentWorkspace = null;
        this.draggedCard = null;
        
        // Bind drag methods to preserve context
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        
        this.init();
    }

    async init() {
        this.attachEventListeners();
        if (this.token) {
            await this.loadUser();
        } else {
            this.showLoginView();
        }
    }

    attachEventListeners() {
        // Auth forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('showRegisterBtn')?.addEventListener('click', () => this.showRegisterView());
        document.getElementById('showLoginBtn')?.addEventListener('click', () => this.showLoginView());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
        
        // Board actions
        document.getElementById('createBoardBtn')?.addEventListener('click', () => this.createBoard());
        document.getElementById('addListBtn')?.addEventListener('click', () => this.addList());
    }

    // ============= AUTH METHODS =============
    
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                this.showWorkspaceView();
            } else {
                alert(data.error || 'Login fehlgeschlagen');
            }
        } catch (error) {
            alert('Verbindungsfehler: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                
                // Create default workspace
                await this.createWorkspace('Mein Arbeitsbereich', 'Persönlicher Arbeitsbereich');
                this.showWorkspaceView();
            } else {
                alert(data.error || 'Registrierung fehlgeschlagen');
            }
        } catch (error) {
            alert('Verbindungsfehler: ' + error.message);
        }
    }

    async handleLogout() {
        if (this.token) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
        }
        
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        this.showLoginView();
    }

    async loadUser() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.showWorkspaceView();
            } else {
                this.handleLogout();
            }
        } catch (error) {
            this.handleLogout();
        }
    }

    // ============= VIEW METHODS =============
    
    showLoginView() {
        document.getElementById('loginView').classList.remove('hidden');
        document.getElementById('registerView').classList.add('hidden');
        document.getElementById('boardView').classList.add('hidden');
        document.getElementById('workspaceView').classList.add('hidden');
        document.getElementById('userMenu').classList.add('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('createBoardBtn').classList.add('hidden');
    }

    showRegisterView() {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('registerView').classList.remove('hidden');
        document.getElementById('boardView').classList.add('hidden');
        document.getElementById('workspaceView').classList.add('hidden');
    }

    async showWorkspaceView() {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('registerView').classList.add('hidden');
        document.getElementById('boardView').classList.add('hidden');
        document.getElementById('workspaceView').classList.remove('hidden');
        
        // Show user info
        document.getElementById('userMenu').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        document.getElementById('createBoardBtn').classList.remove('hidden');
        document.getElementById('userName').textContent = this.user.name;
        
        await this.loadWorkspaces();
    }

    async showBoardView(boardId) {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('registerView').classList.add('hidden');
        document.getElementById('workspaceView').classList.add('hidden');
        document.getElementById('boardView').classList.remove('hidden');
        
        await this.loadBoard(boardId);
    }

    // ============= WORKSPACE METHODS =============
    
    async loadWorkspaces() {
        try {
            const response = await fetch('/api/workspaces', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.renderWorkspaces(data.workspaces);
            }
        } catch (error) {
            console.error('Error loading workspaces:', error);
        }
    }

    renderWorkspaces(workspaces) {
        const container = document.getElementById('workspacesGrid');
        container.innerHTML = '';

        if (workspaces.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Keine Arbeitsbereiche vorhanden</p>
                    <button onclick="app.createWorkspace()" class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                        <i class="fas fa-plus mr-2"></i>Arbeitsbereich erstellen
                    </button>
                </div>
            `;
            return;
        }

        workspaces.forEach(workspace => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6';
            card.onclick = () => this.loadWorkspaceBoards(workspace.id);
            
            card.innerHTML = `
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                        <i class="fas fa-briefcase text-indigo-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg">${workspace.name}</h3>
                        <p class="text-sm text-gray-500">${workspace.description || 'Kein Beschreibung'}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <span><i class="fas fa-calendar-alt mr-1"></i>${new Date(workspace.created_at).toLocaleDateString('de-DE')}</span>
                    <button onclick="event.stopPropagation(); app.viewWorkspaceBoards('${workspace.id}')" class="text-indigo-600 hover:text-indigo-800">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    async createWorkspace(name = null, description = null) {
        name = name || prompt('Name des Arbeitsbereichs:');
        if (!name) return;
        
        description = description || prompt('Beschreibung (optional):');

        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                await this.loadWorkspaces();
            }
        } catch (error) {
            alert('Fehler beim Erstellen des Arbeitsbereichs');
        }
    }

    async loadWorkspaceBoards(workspaceId) {
        this.currentWorkspace = workspaceId;
        
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/boards`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.renderBoards(data.boards);
            }
        } catch (error) {
            console.error('Error loading boards:', error);
        }
    }

    renderBoards(boards) {
        const container = document.getElementById('workspacesGrid');
        container.innerHTML = '';

        // Back button
        const backBtn = document.createElement('div');
        backBtn.className = 'col-span-full mb-4';
        backBtn.innerHTML = `
            <button onclick="app.showWorkspaceView()" class="text-indigo-600 hover:text-indigo-800">
                <i class="fas fa-arrow-left mr-2"></i>Zurück zu Arbeitsbereichen
            </button>
        `;
        container.appendChild(backBtn);

        if (boards.length === 0) {
            container.innerHTML += `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-columns text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Keine Boards vorhanden</p>
                    <button onclick="app.createBoard()" class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                        <i class="fas fa-plus mr-2"></i>Board erstellen
                    </button>
                </div>
            `;
            return;
        }

        boards.forEach(board => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden';
            card.onclick = () => this.showBoardView(board.id);
            
            card.innerHTML = `
                <div class="h-32" style="background: ${board.background_color || '#0079BF'}"></div>
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-2">${board.name}</h3>
                    <p class="text-sm text-gray-500 mb-3">${board.description || 'Keine Beschreibung'}</p>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <span><i class="fas fa-calendar-alt mr-1"></i>${new Date(board.created_at).toLocaleDateString('de-DE')}</span>
                        <button onclick="event.stopPropagation(); app.showBoardView('${board.id}')" class="text-indigo-600 hover:text-indigo-800">
                            Öffnen <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    async createBoard() {
        const name = prompt('Name des Boards:');
        if (!name) return;
        
        const description = prompt('Beschreibung (optional):');
        const colors = ['#0079BF', '#D29034', '#519839', '#B04632', '#89609E', '#CD5A91'];
        const background_color = colors[Math.floor(Math.random() * colors.length)];

        try {
            const response = await fetch('/api/boards', {
                method: 'POST',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    workspace_id: this.currentWorkspace,
                    name, 
                    description,
                    background_color 
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.showBoardView(data.board.id);
            }
        } catch (error) {
            alert('Fehler beim Erstellen des Boards');
        }
    }

    // ============= BOARD METHODS =============
    
    async loadBoard(boardId) {
        try {
            const response = await fetch(`/api/boards/${boardId}`, {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.currentBoard = data.board;
                this.renderBoard(data);
            }
        } catch (error) {
            console.error('Error loading board:', error);
        }
    }

    renderBoard(data) {
        document.getElementById('boardTitle').textContent = data.board.name;
        
        const container = document.getElementById('listsContainer');
        container.innerHTML = '';

        data.lists.forEach(list => {
            const listEl = this.createListElement(list);
            container.appendChild(listEl);
        });
    }

    createListElement(list) {
        const listDiv = document.createElement('div');
        listDiv.className = 'list-column bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0';
        listDiv.dataset.listId = list.id;
        
        listDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-semibold text-gray-800">${list.name}</h3>
                <button onclick="app.addCard('${list.id}')" class="text-gray-500 hover:text-gray-700 transition">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cards-container space-y-2" data-list-id="${list.id}" style="min-height: 60px;">
                ${list.cards ? list.cards.map((card, index) => {
                    // Add position data to each card
                    card.position = index;
                    return this.createCardHTML(card);
                }).join('') : ''}
            </div>
        `;

        // Setup drag and drop for the list
        const cardsContainer = listDiv.querySelector('.cards-container');
        this.setupDropZone(cardsContainer);
        
        // Add visual feedback for drag over
        cardsContainer.addEventListener('dragenter', (e) => {
            if (e.dataTransfer.types.includes('text/html')) {
                listDiv.classList.add('active-drop');
            }
        });
        
        cardsContainer.addEventListener('dragleave', (e) => {
            if (!cardsContainer.contains(e.relatedTarget)) {
                listDiv.classList.remove('active-drop');
            }
        });
        
        cardsContainer.addEventListener('drop', () => {
            listDiv.classList.remove('active-drop');
        });

        return listDiv;
    }

    createCardHTML(card) {
        const dueDate = card.due_date ? new Date(card.due_date).toLocaleDateString('de-DE') : '';
        const labels = card.labels ? card.labels.map(l => 
            `<span class="inline-block px-2 py-1 text-xs rounded" style="background: ${l.color}; color: white;">${l.name}</span>`
        ).join(' ') : '';
        
        const members = card.members ? card.members.map(m => 
            `<div class="w-6 h-6 bg-indigo-600 rounded-full text-white text-xs flex items-center justify-center" title="${m.name}">
                ${m.name.charAt(0).toUpperCase()}
            </div>`
        ).join('') : '';

        return `
            <div class="card-item bg-white p-3 rounded shadow card-shadow cursor-move hover:shadow-md transition" 
                 draggable="true" 
                 data-card-id="${card.id}"
                 data-list-id="${card.list_id}">
                ${labels ? `<div class="mb-2">${labels}</div>` : ''}
                <h4 class="text-sm font-medium mb-2">${card.title}</h4>
                ${card.description ? `<p class="text-xs text-gray-600 mb-2">${card.description}</p>` : ''}
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <div class="flex items-center space-x-2">
                        ${dueDate ? `<span><i class="far fa-calendar"></i> ${dueDate}</span>` : ''}
                        ${card.comments_count > 0 ? `<span><i class="far fa-comment"></i> ${card.comments_count}</span>` : ''}
                        ${card.attachments_count > 0 ? `<span><i class="fas fa-paperclip"></i> ${card.attachments_count}</span>` : ''}
                    </div>
                    ${members ? `<div class="flex -space-x-2">${members}</div>` : ''}
                </div>
            </div>
        `;
    }

    setupDropZone(container) {
        // Make container a drop zone
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(container, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (dragging) {
                if (afterElement == null) {
                    container.appendChild(dragging);
                } else {
                    container.insertBefore(dragging, afterElement);
                }
            }
        });

        // Setup dragging for all cards in this container
        this.setupCardDragging(container);
    }

    setupCardDragging(container) {
        container.querySelectorAll('.card-item').forEach(card => {
            // Remove old listeners to prevent duplicates
            card.removeEventListener('dragstart', this.handleDragStart);
            card.removeEventListener('dragend', this.handleDragEnd);
            card.removeEventListener('click', this.handleCardClick);
            
            // Add new listeners
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
            card.addEventListener('click', this.handleCardClick.bind(this));
        });
    }

    handleDragStart(e) {
        const card = e.currentTarget;
        card.classList.add('dragging');
        this.draggedCard = card;
        this.draggedCardOriginalList = card.parentElement;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.cardId);
        
        // Create a better drag image
        const dragImage = card.cloneNode(true);
        dragImage.style.opacity = '0.8';
        dragImage.style.transform = 'rotate(5deg)';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    }

    handleDragEnd(e) {
        const card = e.currentTarget;
        card.classList.remove('dragging');
        
        // Clean up any visual states
        document.querySelectorAll('.cards-container').forEach(container => {
            container.classList.remove('drag-over');
        });
        
        document.querySelectorAll('.list-column').forEach(column => {
            column.classList.remove('active-drop');
        });
        
        // Get the new list and position
        const newList = card.parentElement;
        if (!newList || !newList.classList.contains('cards-container')) {
            // Card was not dropped in a valid location, return to original position
            if (this.draggedCardOriginalList) {
                this.draggedCardOriginalList.appendChild(card);
            }
            this.draggedCard = null;
            return;
        }
        
        const newListId = newList.dataset.listId;
        const cardId = card.dataset.cardId;
        const oldListId = card.dataset.listId;
        
        // Calculate position based on siblings
        const cards = Array.from(newList.querySelectorAll('.card-item'));
        const position = cards.indexOf(card);
        
        // Only update if the card was actually moved
        if (newListId && (newListId !== oldListId || position !== parseInt(card.dataset.position))) {
            this.moveCard(cardId, newListId, position);
            card.dataset.listId = newListId;
            card.dataset.position = position;
        }
        
        this.draggedCard = null;
        this.draggedCardOriginalList = null;
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDrop(e) {
        e.preventDefault();
        const container = e.currentTarget;
        container.classList.remove('drag-over');
        container.parentElement.classList.remove('active-drop');
    }

    handleCardClick(e) {
        // Prevent click event when dragging
        if (!e.currentTarget.classList.contains('dragging')) {
            const cardId = e.currentTarget.dataset.cardId;
            this.showCardDetails(cardId);
        }
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.card-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async addList() {
        const name = prompt('Name der neuen Liste:');
        if (!name) return;

        const position = document.querySelectorAll('#listsContainer > div').length;

        try {
            const response = await fetch(`/api/boards/${this.currentBoard.id}/lists`, {
                method: 'POST',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, position })
            });

            if (response.ok) {
                await this.loadBoard(this.currentBoard.id);
            }
        } catch (error) {
            alert('Fehler beim Erstellen der Liste');
        }
    }

    async addCard(listId) {
        const title = prompt('Titel der Karte:');
        if (!title) return;

        const container = document.querySelector(`[data-list-id="${listId}"]`);
        const position = container.children.length;

        try {
            const response = await fetch(`/api/lists/${listId}/cards`, {
                method: 'POST',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, position })
            });

            if (response.ok) {
                await this.loadBoard(this.currentBoard.id);
            }
        } catch (error) {
            alert('Fehler beim Erstellen der Karte');
        }
    }

    async moveCard(cardId, listId, position = 0) {
        try {
            const response = await fetch(`/api/cards/${cardId}/move`, {
                method: 'PUT',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ list_id: listId, position })
            });
            
            if (!response.ok) {
                console.error('Failed to move card');
                // Reload board to reset positions if move failed
                await this.loadBoard(this.currentBoard.id);
            }
        } catch (error) {
            console.error('Error moving card:', error);
            // Reload board to reset positions on error
            await this.loadBoard(this.currentBoard.id);
        }
    }

    showCardDetails(cardId) {
        // Card details modal would go here
        console.log('Show card details:', cardId);
    }

    // ============= UTILITY METHODS =============
    
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    viewWorkspaceBoards(workspaceId) {
        this.loadWorkspaceBoards(workspaceId);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaskBoardApp();
});