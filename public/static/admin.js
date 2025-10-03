// TaskBoard Admin Dashboard
class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('token');
        if (!this.token) {
            window.location.href = '/';
            return;
        }
        this.init();
    }

    async init() {
        await this.checkAdminAccess();
        this.renderDashboard();
        this.loadUsers();
        this.loadActivityLogs();
    }

    async checkAdminAccess() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.user.role !== 'admin') {
                    alert('Keine Admin-Berechtigung');
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

    renderDashboard() {
        const app = document.getElementById('adminApp');
        app.innerHTML = `
            <nav class="bg-gray-900 text-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <i class="fas fa-cog text-2xl mr-3"></i>
                            <h1 class="text-xl font-bold">TaskBoard Admin</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span>Angemeldet als: ${this.user.name}</span>
                            <a href="/" class="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                <i class="fas fa-arrow-left mr-2"></i>Zurück zur App
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <div class="max-w-7xl mx-auto px-4 py-8">
                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-indigo-100 rounded-full">
                                <i class="fas fa-users text-2xl text-indigo-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-500">Benutzer</p>
                                <p id="userCount" class="text-2xl font-bold">-</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-green-100 rounded-full">
                                <i class="fas fa-shield-alt text-2xl text-green-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-500">Admins</p>
                                <p id="adminCount" class="text-2xl font-bold">-</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-yellow-100 rounded-full">
                                <i class="fas fa-eye text-2xl text-yellow-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-500">Beobachter</p>
                                <p id="observerCount" class="text-2xl font-bold">-</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="p-3 bg-red-100 rounded-full">
                                <i class="fas fa-user-slash text-2xl text-red-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-gray-500">Inaktiv</p>
                                <p id="inactiveCount" class="text-2xl font-bold">-</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Users Table -->
                <div class="bg-white rounded-lg shadow mb-8">
                    <div class="px-6 py-4 border-b">
                        <h2 class="text-xl font-semibold">Benutzerverwaltung</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rolle</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registriert</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody" class="divide-y divide-gray-200">
                                <!-- Users will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Activity Logs -->
                <div class="bg-white rounded-lg shadow">
                    <div class="px-6 py-4 border-b">
                        <h2 class="text-xl font-semibold">Aktivitätsprotokolle</h2>
                    </div>
                    <div class="p-6">
                        <div id="activityLogs" class="space-y-2">
                            <!-- Activity logs will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.renderUsers(data.users);
                this.updateStats(data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-indigo-600 font-medium">${user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span class="font-medium">${user.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select onchange="adminDashboard.changeUserRole('${user.id}', this.value)" 
                            class="text-sm border rounded px-2 py-1" ${user.id === this.user.id ? 'disabled' : ''}>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="member" ${user.role === 'member' ? 'selected' : ''}>Mitglied</option>
                        <option value="observer" ${user.role === 'observer' ? 'selected' : ''}>Beobachter</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${user.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${new Date(user.created_at).toLocaleDateString('de-DE')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${user.id !== this.user.id && user.is_active ? `
                        <button onclick="adminDashboard.deactivateUser('${user.id}')" 
                                class="text-red-600 hover:text-red-800">
                            <i class="fas fa-user-slash"></i> Deaktivieren
                        </button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateStats(users) {
        document.getElementById('userCount').textContent = users.length;
        document.getElementById('adminCount').textContent = users.filter(u => u.role === 'admin').length;
        document.getElementById('observerCount').textContent = users.filter(u => u.role === 'observer').length;
        document.getElementById('inactiveCount').textContent = users.filter(u => !u.is_active).length;
    }

    async changeUserRole(userId, newRole) {
        if (!confirm(`Rolle wirklich ändern auf: ${newRole}?`)) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                this.loadUsers();
            }
        } catch (error) {
            alert('Fehler beim Ändern der Rolle');
        }
    }

    async deactivateUser(userId) {
        if (!confirm('Benutzer wirklich deaktivieren?')) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                this.loadUsers();
            }
        } catch (error) {
            alert('Fehler beim Deaktivieren');
        }
    }

    async loadActivityLogs() {
        try {
            const response = await fetch('/api/admin/activity?limit=50', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.renderActivityLogs(data.logs);
            }
        } catch (error) {
            console.error('Error loading activity logs:', error);
        }
    }

    renderActivityLogs(logs) {
        const container = document.getElementById('activityLogs');
        
        if (logs.length === 0) {
            container.innerHTML = '<p class="text-gray-500">Keine Aktivitäten vorhanden</p>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-history text-indigo-600 text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm">
                        <span class="font-medium">${log.user_name}</span>
                        <span class="text-gray-600">${this.getActionText(log.action)}</span>
                    </p>
                    <p class="text-xs text-gray-500">${new Date(log.created_at).toLocaleString('de-DE')}</p>
                </div>
            </div>
        `).join('');
    }

    getActionText(action) {
        const actions = {
            'card_created': 'hat eine Karte erstellt',
            'card_moved': 'hat eine Karte verschoben',
            'card_updated': 'hat eine Karte aktualisiert',
            'comment_added': 'hat einen Kommentar hinzugefügt',
            'board_created': 'hat ein Board erstellt',
            'user_joined': 'ist beigetreten'
        };
        return actions[action] || action;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }
}

// Initialize admin dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});