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
        this.initializeFeatureManagers();
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
        
        // Mobile specific
        document.getElementById('mobileAddListBtn')?.addEventListener('click', () => this.addList());
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Advanced Features
        document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
            if (window.themeManager) {
                window.themeManager.showThemeSelector();
            }
        });
        
        document.getElementById('analyticsBtn')?.addEventListener('click', () => {
            if (window.analyticsDashboard) {
                window.analyticsDashboard.show();
            }
        });
        
        document.getElementById('gamificationBtn')?.addEventListener('click', () => {
            if (window.gamificationSystem && this.user) {
                window.gamificationSystem.showProfile(this.user.id);
            }
        });
        
    }
    
    initializeFeatureManagers() {
        // Initialize theme with user preference
        if (window.themeManager) {
            const savedTheme = localStorage.getItem('selectedTheme');
            if (savedTheme) {
                window.themeManager.applyTheme(savedTheme);
            }
        }
        
        // Initialize gamification for logged-in users
        setTimeout(() => {
            if (window.gamificationSystem && this.user) {
                window.gamificationSystem.initializeUser(this.user.id);
                this.updateLevelBadge();
            }
        }, 100);
        
        // Touch support detection
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Add mobile class to body if touch device
        if (this.isTouchDevice) {
            document.body.classList.add('touch-device');
        }
    }
    
    toggleMobileMenu() {
        // Create mobile menu overlay
        const existingMenu = document.getElementById('mobileMenuOverlay');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'mobileMenuOverlay';
        overlay.className = 'fixed inset-0 bg-black/50 z-50 sm:hidden';
        overlay.innerHTML = `
            <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 space-y-2">
                <button onclick="app.addList(); app.toggleMobileMenu();" class="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                    <i class="fas fa-plus mr-3"></i>Neue Liste
                </button>
                <button onclick="app.showBoardSettings(); app.toggleMobileMenu();" class="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                    <i class="fas fa-cog mr-3"></i>Board-Einstellungen
                </button>
                <button onclick="app.showWorkspaceView(); app.toggleMobileMenu();" class="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                    <i class="fas fa-home mr-3"></i>Zur Übersicht
                </button>
                <button onclick="app.toggleMobileMenu();" class="w-full text-center p-3 bg-gray-100 rounded-lg font-medium">
                    Abbrechen
                </button>
            </div>
        `;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        document.body.appendChild(overlay);
    }
    
    showBoardSettings() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass rounded-xl p-6 max-w-md w-full animate-fade-in">
                <h3 class="text-xl font-bold mb-4"><i class="fas fa-cog mr-2"></i>Board-Einstellungen</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2">Board Name</label>
                        <input type="text" value="${this.currentBoard?.name || ''}" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Hintergrundfarbe</label>
                        <div class="flex space-x-2">
                            <button class="w-8 h-8 rounded" style="background: #0079BF"></button>
                            <button class="w-8 h-8 rounded" style="background: #D29034"></button>
                            <button class="w-8 h-8 rounded" style="background: #519839"></button>
                            <button class="w-8 h-8 rounded" style="background: #B04632"></button>
                            <button class="w-8 h-8 rounded" style="background: #89609E"></button>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                            Abbrechen
                        </button>
                        <button onclick="app.showToast('Einstellungen gespeichert', 'success'); this.closest('.fixed').remove()" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                            Speichern
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Quick login for demo accounts
    quickLogin(email, password) {
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
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
                
                // Initialize features for logged-in user
                this.initializeUserFeatures();
            } else {
                this.handleLogout();
            }
        } catch (error) {
            this.handleLogout();
        }
    }

    // ============= FEATURE INTEGRATION =============
    
    initializeUserFeatures() {
        // Show advanced feature buttons
        document.getElementById('themeToggleBtn')?.classList.remove('hidden');
        document.getElementById('analyticsBtn')?.classList.remove('hidden');
        document.getElementById('gamificationBtn')?.classList.remove('hidden');
        
        // Initialize gamification
        if (window.gamificationSystem && this.user) {
            window.gamificationSystem.initializeUser(this.user.id);
            this.updateLevelBadge();
        }
    }
    
    updateLevelBadge() {
        if (window.gamificationSystem) {
            const level = window.gamificationSystem.getUserLevel();
            const badge = document.getElementById('levelBadge');
            if (badge && level > 0) {
                badge.textContent = level;
                badge.classList.remove('hidden');
            }
        }
    }
    
    trackAnalytics(action, data = {}) {
        if (window.analyticsDashboard) {
            window.analyticsDashboard.trackEvent(action, {
                boardId: this.currentBoard?.id,
                userId: this.user?.id,
                ...data
            });
        }
    }
    
    checkAchievements(action, data = {}) {
        if (window.gamificationSystem && this.user) {
            window.gamificationSystem.checkAchievement(action, data);
            this.updateLevelBadge();
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
        // Hide advanced features when logged out
        document.getElementById('themeToggleBtn')?.classList.add('hidden');
        document.getElementById('analyticsBtn')?.classList.add('hidden');
        document.getElementById('gamificationBtn')?.classList.add('hidden');
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
        
        // Show user info and buttons
        document.getElementById('userMenu').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        document.getElementById('createBoardBtn').classList.remove('hidden');
        
        // Show advanced feature buttons
        document.getElementById('themeToggleBtn')?.classList.remove('hidden');
        document.getElementById('analyticsBtn')?.classList.remove('hidden');
        document.getElementById('gamificationBtn')?.classList.remove('hidden');
        
        // Update user name
        if (this.user) {
            document.getElementById('userName').textContent = this.user.name;
        }
        
        await this.loadWorkspaces();
    }

    async showBoardView(boardId) {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('registerView').classList.add('hidden');
        document.getElementById('workspaceView').classList.add('hidden');
        document.getElementById('boardView').classList.remove('hidden');
        
        // Keep navigation buttons visible
        document.getElementById('userMenu').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        
        // Show advanced features in board view
        document.getElementById('themeToggleBtn')?.classList.remove('hidden');
        document.getElementById('analyticsBtn')?.classList.remove('hidden');
        document.getElementById('gamificationBtn')?.classList.remove('hidden');
        
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
            card.className = 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer p-5 border border-gray-100';
            card.onclick = () => this.loadWorkspaceBoards(workspace.id);
            
            card.innerHTML = `
                <div class="flex items-center mb-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-briefcase text-white text-sm"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-base text-gray-800">${workspace.name}</h3>
                        <p class="text-xs text-gray-500">${workspace.description || 'Keine Beschreibung'}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center text-xs text-gray-400">
                    <span><i class="far fa-calendar mr-1"></i>${new Date(workspace.created_at).toLocaleDateString('de-DE')}</span>
                    <button onclick="event.stopPropagation(); app.viewWorkspaceBoards('${workspace.id}')" 
                            class="text-indigo-600 hover:text-indigo-700 font-medium">
                        Öffnen <i class="fas fa-chevron-right ml-1 text-xs"></i>
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
            card.className = 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100';
            card.onclick = () => this.showBoardView(board.id);
            
            card.innerHTML = `
                <div class="h-24 relative" style="background: linear-gradient(135deg, ${board.background_color || '#0079BF'}, ${board.background_color || '#0079BF'}dd)">
                    <div class="absolute inset-0 bg-black/10"></div>
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-base text-gray-800 mb-1">${board.name}</h3>
                    <p class="text-xs text-gray-500 mb-3 line-clamp-2">${board.description || 'Keine Beschreibung'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-400">
                            <i class="far fa-calendar mr-1"></i>${new Date(board.created_at).toLocaleDateString('de-DE')}
                        </span>
                        <button onclick="event.stopPropagation(); app.showBoardView('${board.id}')" 
                                class="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                            Öffnen <i class="fas fa-chevron-right ml-0.5" style="font-size: 10px;"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    async createBoard() {
        // Use board features template selector if available
        if (window.boardFeatures) {
            window.boardFeatures.showTemplateSelector(async (template) => {
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
                            background_color,
                            template: template?.id
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Apply template if selected
                        if (template) {
                            await window.boardFeatures.applyTemplate(data.board.id, template);
                        }
                        
                        this.showBoardView(data.board.id);
                        
                        // Track creation
                        this.trackAnalytics('board_created', { template: template?.id });
                        this.checkAchievements('board_created');
                    }
                } catch (error) {
                    alert('Fehler beim Erstellen des Boards');
                }
            });
            return;
        }
        
        // Fallback to simple creation
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
        const isMobile = window.innerWidth < 640;
        listDiv.className = `list-column bg-white/90 backdrop-blur rounded-lg p-3 ${isMobile ? 'w-72' : 'w-72'} flex-shrink-0 shadow-sm`;
        listDiv.dataset.listId = list.id;
        
        listDiv.innerHTML = `
            <div class="flex justify-between items-center mb-3 px-2">
                <h3 class="font-semibold text-gray-700 text-sm">${list.name}</h3>
                <button onclick="app.addCard('${list.id}')" class="text-gray-400 hover:text-gray-600 active:text-gray-800 transition p-2 -mr-2">
                    <i class="fas fa-plus text-xs"></i>
                </button>
            </div>
            <div class="cards-container space-y-2 px-1" data-list-id="${list.id}" style="min-height: 40px;">
                ${list.cards ? list.cards.map((card, index) => {
                    // Add position data to each card
                    card.position = index;
                    return this.createCardHTML(card);
                }).join('') : ''}
            </div>
            <button onclick="app.addCard('${list.id}')" class="w-full mt-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded text-xs transition">
                <i class="fas fa-plus mr-1"></i>Karte hinzufügen
            </button>
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
            `<span class="inline-block px-1.5 py-0.5 text-xs rounded-sm font-medium" style="background: ${l.color}; color: white;">${l.name}</span>`
        ).join(' ') : '';
        
        const members = card.members ? card.members.map(m => 
            `<div class="w-5 h-5 bg-indigo-500 rounded-full text-white text-xs flex items-center justify-center ring-2 ring-white" title="${m.name}">
                ${m.name.charAt(0).toUpperCase()}
            </div>`
        ).join('') : '';

        // Determine if we need to show badges
        const hasExtras = dueDate || card.comments_count > 0 || card.attachments_count > 0 || members;

        return `
            <div class="card-item bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 cursor-move border border-gray-100" 
                 draggable="true" 
                 data-card-id="${card.id}"
                 data-list-id="${card.list_id}">
                <div class="p-2.5">
                    ${labels ? `<div class="flex flex-wrap gap-1 mb-2">${labels}</div>` : ''}
                    <h4 class="text-sm text-gray-800 font-normal leading-snug">${card.title}</h4>
                    ${card.description ? `<p class="text-xs text-gray-500 mt-1 line-clamp-2">${card.description}</p>` : ''}
                    ${hasExtras ? `
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <div class="flex items-center gap-3 text-xs text-gray-400">
                            ${dueDate ? `<span class="flex items-center gap-1"><i class="far fa-clock text-xs"></i> ${dueDate}</span>` : ''}
                            ${card.comments_count > 0 ? `<span class="flex items-center gap-1"><i class="far fa-comment"></i> ${card.comments_count}</span>` : ''}
                            ${card.attachments_count > 0 ? `<span class="flex items-center gap-1"><i class="fas fa-paperclip"></i> ${card.attachments_count}</span>` : ''}
                        </div>
                        ${members ? `<div class="flex -space-x-1.5">${members}</div>` : ''}
                    </div>
                    ` : ''}
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
            card.removeEventListener('touchstart', this.handleTouchStart);
            card.removeEventListener('touchmove', this.handleTouchMove);
            card.removeEventListener('touchend', this.handleTouchEnd);
            
            // Add desktop drag listeners
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
            card.addEventListener('click', this.handleCardClick.bind(this));
            
            // Add touch support for mobile
            if (this.isTouchDevice) {
                card.addEventListener('touchstart', this.handleTouchStart.bind(this), {passive: false});
                card.addEventListener('touchmove', this.handleTouchMove.bind(this), {passive: false});
                card.addEventListener('touchend', this.handleTouchEnd.bind(this));
            }
        });
    }
    
    // Touch event handlers for mobile drag and drop
    handleTouchStart(e) {
        const card = e.currentTarget;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
        this.touchCard = card;
        this.touchTimeout = setTimeout(() => {
            card.classList.add('dragging');
            this.draggedCard = card;
            this.draggedCardOriginalList = card.parentElement;
            // Haptic feedback if available
            if (window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }, 200); // Long press to start drag
    }
    
    handleTouchMove(e) {
        if (!this.draggedCard) {
            // Clear timeout if moving before long press
            clearTimeout(this.touchTimeout);
            return;
        }
        
        e.preventDefault();
        const touch = e.touches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (elementBelow) {
            const dropZone = elementBelow.closest('.cards-container');
            if (dropZone && dropZone !== this.currentDropZone) {
                // Remove highlight from previous zone
                if (this.currentDropZone) {
                    this.currentDropZone.classList.remove('drag-over');
                }
                // Add highlight to new zone
                dropZone.classList.add('drag-over');
                this.currentDropZone = dropZone;
                
                // Move card preview
                const afterElement = this.getDragAfterElement(dropZone, touch.clientY);
                if (afterElement == null) {
                    dropZone.appendChild(this.draggedCard);
                } else {
                    dropZone.insertBefore(this.draggedCard, afterElement);
                }
            }
        }
    }
    
    handleTouchEnd(e) {
        clearTimeout(this.touchTimeout);
        if (this.draggedCard) {
            this.handleDragEnd({currentTarget: this.draggedCard});
        }
        this.touchCard = null;
        this.currentDropZone = null;
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
        // Use enhanced card creation if collaboration features are available
        if (window.collaborationFeatures) {
            window.collaborationFeatures.showEnhancedCardCreator(listId, async (cardData) => {
                await this.createCardWithData(listId, cardData);
            });
            return;
        }
        
        // Fallback to simple prompt
        const title = prompt('Titel der Karte:');
        if (!title) return;

        const container = document.querySelector(`[data-list-id="${listId}"]`);
        const position = container.children.length;

        // Add skeleton loader while creating
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton h-20 rounded-md mb-2';
        container.appendChild(skeleton);

        try {
            const response = await fetch(`/api/lists/${listId}/cards`, {
                method: 'POST',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, position })
            });

            if (response.ok) {
                // Remove skeleton
                skeleton.remove();
                
                // Reload board with animation
                await this.loadBoard(this.currentBoard.id);
                
                // Add animation class to new card
                setTimeout(() => {
                    const cards = container.querySelectorAll('.card-item');
                    if (cards.length > 0) {
                        const newCard = cards[cards.length - 1];
                        newCard.classList.add('new-card', 'bounce-in');
                    }
                }, 100);
                
                // Success feedback
                this.showToast('Karte erfolgreich erstellt', 'success');
                
                // Track analytics and achievements
                this.trackAnalytics('card_created', { listId });
                this.checkAchievements('card_created', { boardId: this.currentBoard.id });
            } else {
                skeleton.remove();
                this.showToast('Fehler beim Erstellen der Karte', 'error');
            }
        } catch (error) {
            skeleton.remove();
            this.showToast('Verbindungsfehler', 'error');
        }
    }
    
    async createCardWithData(listId, cardData) {
        const container = document.querySelector(`[data-list-id="${listId}"]`);
        const position = container.children.length;
        
        // Add skeleton loader while creating
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton h-20 rounded-md mb-2';
        container.appendChild(skeleton);
        
        try {
            const response = await fetch(`/api/lists/${listId}/cards`, {
                method: 'POST',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cardData, position })
            });
            
            if (response.ok) {
                skeleton.remove();
                await this.loadBoard(this.currentBoard.id);
                
                // Add animations and feedback
                setTimeout(() => {
                    const cards = container.querySelectorAll('.card-item');
                    if (cards.length > 0) {
                        const newCard = cards[cards.length - 1];
                        newCard.classList.add('new-card', 'bounce-in');
                    }
                }, 100);
                
                this.showToast('Karte erfolgreich erstellt', 'success');
                this.trackAnalytics('card_created', { listId, hasDescription: !!cardData.description });
                this.checkAchievements('card_created', { boardId: this.currentBoard.id });
            } else {
                skeleton.remove();
                this.showToast('Fehler beim Erstellen der Karte', 'error');
            }
        } catch (error) {
            skeleton.remove();
            this.showToast('Verbindungsfehler', 'error');
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 glass fade-in ${
            type === 'success' ? 'bg-green-500/90' : 
            type === 'error' ? 'bg-red-500/90' : 
            'bg-blue-500/90'
        } text-white`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${
                    type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    'info-circle'
                } mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('translate-y-0'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Add ripple effect to clicks
    addRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    async moveCard(cardId, listId, position = 0) {
        try {
            const response = await fetch(`/api/cards/${cardId}/move`, {
                method: 'PUT',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ list_id: listId, position })
            });
            
            if (response.ok) {
                // Track successful card move
                this.trackAnalytics('card_moved', { cardId, listId });
                this.checkAchievements('card_moved', { boardId: this.currentBoard.id });
            } else {
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
        // Use collaboration features for enhanced card view if available
        if (window.collaborationFeatures) {
            window.collaborationFeatures.showEnhancedCardModal(cardId);
        } else {
            // Fallback to simple view
            console.log('Show card details:', cardId);
        }
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