// Enhanced Admin Panel
class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('token');
        this.currentView = 'dashboard';
        this.init();
    }
    
    async init() {
        if (!this.token) {
            window.location.href = '/';
            return;
        }
        
        await this.checkAdminAccess();
        this.render();
        this.attachEventListeners();
        this.loadDashboard();
    }
    
    async checkAdminAccess() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.user.role !== 'admin') {
                    alert('Keine Admin-Berechtigung!');
                    window.location.href = '/';
                }
                this.user = data.user;
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            window.location.href = '/';
        }
    }
    
    render() {
        document.body.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Sidebar -->
                <div class="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
                    <div class="p-4">
                        <h1 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-shield-alt mr-2 text-yellow-400"></i>
                            Admin Panel
                        </h1>
                        <p class="text-sm text-gray-400 mt-1">${this.user?.name || 'Administrator'}</p>
                    </div>
                    
                    <nav class="mt-8">
                        <a href="#" data-view="dashboard" class="nav-item active">
                            <i class="fas fa-tachometer-alt mr-3"></i>Dashboard
                        </a>
                        <a href="#" data-view="users" class="nav-item">
                            <i class="fas fa-users mr-3"></i>Mitarbeiter
                        </a>
                        <a href="#" data-view="workspaces" class="nav-item">
                            <i class="fas fa-building mr-3"></i>Arbeitsbereiche
                        </a>
                        <a href="#" data-view="trash" class="nav-item">
                            <i class="fas fa-trash-alt mr-3"></i>Papierkorb
                        </a>
                        <a href="#" data-view="audit" class="nav-item">
                            <i class="fas fa-history mr-3"></i>Aktivitätslog
                        </a>
                        <a href="#" data-view="settings" class="nav-item">
                            <i class="fas fa-cog mr-3"></i>Einstellungen
                        </a>
                    </nav>
                    
                    <div class="absolute bottom-0 w-full p-4">
                        <button onclick="adminPanel.logout()" class="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center justify-center">
                            <i class="fas fa-sign-out-alt mr-2"></i>Abmelden
                        </button>
                        <a href="/" class="block mt-2 text-center text-gray-400 hover:text-white">
                            <i class="fas fa-arrow-left mr-2"></i>Zur App
                        </a>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="ml-64">
                    <!-- Header -->
                    <div class="bg-white shadow-sm border-b">
                        <div class="px-8 py-4">
                            <h2 id="viewTitle" class="text-2xl font-bold text-gray-800">Dashboard</h2>
                        </div>
                    </div>
                    
                    <!-- Content Area -->
                    <div id="contentArea" class="p-8">
                        <!-- Dynamic content will be loaded here -->
                    </div>
                </div>
            </div>
            
            <style>
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 24px;
                    color: #9CA3AF;
                    transition: all 0.2s;
                }
                .nav-item:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }
                .nav-item.active {
                    background: rgba(99,102,241,0.3);
                    color: white;
                    border-left: 3px solid #6366f1;
                }
                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
            </style>
        `;
    }
    
    attachEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.switchView(view);
            });
        });
    }
    
    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === view) {
                item.classList.add('active');
            }
        });
        
        const titles = {
            dashboard: 'Dashboard',
            users: 'Mitarbeiterverwaltung',
            workspaces: 'Arbeitsbereiche',
            trash: 'Papierkorb',
            audit: 'Aktivitätslog',
            settings: 'Systemeinstellungen'
        };
        
        document.getElementById('viewTitle').textContent = titles[view];
        
        // Load view content
        switch(view) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'workspaces':
                this.loadWorkspaces();
                break;
            case 'trash':
                this.loadTrash();
                break;
            case 'audit':
                this.loadAuditLog();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
    
    async loadDashboard() {
        const stats = await this.getStats();
        
        document.getElementById('contentArea').innerHTML = `
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="stat-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Mitarbeiter</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.users || 0}</p>
                        </div>
                        <i class="fas fa-users text-3xl text-blue-500"></i>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Arbeitsbereiche</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.workspaces || 0}</p>
                        </div>
                        <i class="fas fa-building text-3xl text-green-500"></i>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Boards</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.boards || 0}</p>
                        </div>
                        <i class="fas fa-th text-3xl text-purple-500"></i>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Karten</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.cards || 0}</p>
                        </div>
                        <i class="fas fa-sticky-note text-3xl text-orange-500"></i>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 class="text-lg font-semibold mb-4">Schnellaktionen</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="adminPanel.showAddUserModal()" class="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center">
                        <i class="fas fa-user-plus mr-2"></i>Mitarbeiter hinzufügen
                    </button>
                    <button onclick="adminPanel.showInviteModal()" class="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center">
                        <i class="fas fa-envelope mr-2"></i>Einladung senden
                    </button>
                    <button onclick="adminPanel.switchView('trash')" class="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center">
                        <i class="fas fa-trash-restore mr-2"></i>Papierkorb prüfen
                    </button>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold mb-4">Letzte Aktivitäten</h3>
                <div id="recentActivity" class="space-y-3">
                    <!-- Activity items will be loaded here -->
                </div>
            </div>
        `;
        
        this.loadRecentActivity();
    }
    
    async loadUsers() {
        const users = await this.getUsers();
        
        document.getElementById('contentArea').innerHTML = `
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Mitarbeiter verwalten</h3>
                    <button onclick="adminPanel.showAddUserModal()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        <i class="fas fa-plus mr-2"></i>Neuer Mitarbeiter
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rolle</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Erstellt</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${users.map(user => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <div class="h-10 w-10 flex-shrink-0 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">${user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                              user.role === 'member' ? 'bg-green-100 text-green-800' : 
                                              'bg-gray-100 text-gray-800'}">
                                            ${user.role}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Aktiv
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${new Date(user.created_at).toLocaleDateString('de-DE')}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="adminPanel.editUser('${user.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="adminPanel.resetPassword('${user.id}')" class="text-yellow-600 hover:text-yellow-900 mr-3">
                                            <i class="fas fa-key"></i>
                                        </button>
                                        ${user.id !== this.user.id ? `
                                            <button onclick="adminPanel.deleteUser('${user.id}')" class="text-red-600 hover:text-red-900">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    async loadTrash() {
        const trash = await this.getTrash();
        
        document.getElementById('contentArea').innerHTML = `
            <div class="space-y-6">
                <!-- Deleted Boards -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-4">Gelöschte Boards</h3>
                    ${trash.boards && trash.boards.length > 0 ? `
                        <div class="space-y-3">
                            ${trash.boards.map(board => `
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-medium">${board.name}</p>
                                        <p class="text-sm text-gray-500">
                                            Gelöscht von ${board.deleted_by_name} am ${new Date(board.deleted_at).toLocaleString('de-DE')}
                                        </p>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button onclick="adminPanel.restore('board', '${board.id}')" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                            <i class="fas fa-undo mr-1"></i>Wiederherstellen
                                        </button>
                                        <button onclick="adminPanel.permanentDelete('board', '${board.id}')" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                            <i class="fas fa-times mr-1"></i>Endgültig löschen
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-gray-500">Keine gelöschten Boards</p>'}
                </div>
                
                <!-- Deleted Cards -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold mb-4">Gelöschte Karten</h3>
                    ${trash.cards && trash.cards.length > 0 ? `
                        <div class="space-y-3">
                            ${trash.cards.map(card => `
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-medium">${card.title}</p>
                                        <p class="text-sm text-gray-500">
                                            Aus Liste "${card.list_name}" - Gelöscht von ${card.deleted_by_name} am ${new Date(card.deleted_at).toLocaleString('de-DE')}
                                        </p>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button onclick="adminPanel.restore('card', '${card.id}')" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                            <i class="fas fa-undo mr-1"></i>Wiederherstellen
                                        </button>
                                        <button onclick="adminPanel.permanentDelete('card', '${card.id}')" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                            <i class="fas fa-times mr-1"></i>Endgültig löschen
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-gray-500">Keine gelöschten Karten</p>'}
                </div>
            </div>
        `;
    }
    
    // Modal Functions
    showAddUserModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-bold mb-4">Neuer Mitarbeiter</h3>
                <form id="addUserForm">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Name</label>
                        <input type="text" id="userName" required class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">E-Mail</label>
                        <input type="email" id="userEmail" required class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Passwort</label>
                        <input type="password" id="userPassword" required class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Rolle</label>
                        <select id="userRole" class="w-full px-4 py-2 border rounded-lg">
                            <option value="member">Mitarbeiter</option>
                            <option value="admin">Administrator</option>
                            <option value="observer">Beobachter</option>
                        </select>
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                            Erstellen
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modal.querySelector('#addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createUser({
                name: modal.querySelector('#userName').value,
                email: modal.querySelector('#userEmail').value,
                password: modal.querySelector('#userPassword').value,
                role: modal.querySelector('#userRole').value
            });
            modal.remove();
            this.loadUsers();
        });
        
        document.body.appendChild(modal);
    }
    
    async resetPassword(userId) {
        const password = prompt('Neues Passwort (min. 6 Zeichen):');
        if (!password || password.length < 6) {
            alert('Passwort muss mindestens 6 Zeichen haben!');
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/users/${userId}/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            
            if (response.ok) {
                alert('Passwort erfolgreich geändert!');
            }
        } catch (error) {
            alert('Fehler beim Ändern des Passworts');
        }
    }
    
    async restore(type, id) {
        if (!confirm('Wirklich wiederherstellen?')) return;
        
        try {
            const response = await fetch(`/api/admin/restore/${type}/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                alert('Erfolgreich wiederhergestellt!');
                this.loadTrash();
            }
        } catch (error) {
            alert('Fehler beim Wiederherstellen');
        }
    }
    
    async permanentDelete(type, id) {
        if (!confirm('ACHTUNG: Diese Aktion kann nicht rückgängig gemacht werden! Wirklich endgültig löschen?')) return;
        
        try {
            const response = await fetch(`/api/admin/permanent/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                alert('Endgültig gelöscht!');
                this.loadTrash();
            }
        } catch (error) {
            alert('Fehler beim Löschen');
        }
    }
    
    // API Methods
    async getStats() {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            return response.ok ? await response.json() : {};
        } catch {
            return {};
        }
    }
    
    async getUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            return data.users || [];
        } catch {
            return [];
        }
    }
    
    async getTrash() {
        try {
            const response = await fetch('/api/admin/trash', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            return response.ok ? await response.json() : { boards: [], cards: [] };
        } catch {
            return { boards: [], cards: [] };
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});