// Advanced Board Features
class BoardFeatures {
    constructor(app) {
        this.app = app;
        this.templates = {
            scrum: {
                name: 'Scrum Board',
                lists: ['Backlog', 'Sprint Planning', 'In Progress', 'Review', 'Done'],
                labels: [
                    { name: 'Bug', color: '#ef4444' },
                    { name: 'Feature', color: '#10b981' },
                    { name: 'Task', color: '#3b82f6' },
                    { name: 'Story', color: '#8b5cf6' }
                ]
            },
            kanban: {
                name: 'Kanban Board',
                lists: ['To Do', 'In Progress', 'Testing', 'Done'],
                wipLimits: { 'In Progress': 3, 'Testing': 2 }
            },
            bugTracking: {
                name: 'Bug Tracking',
                lists: ['New', 'Confirmed', 'In Progress', 'Testing', 'Resolved', 'Closed'],
                labels: [
                    { name: 'Critical', color: '#dc2626' },
                    { name: 'High', color: '#f59e0b' },
                    { name: 'Medium', color: '#3b82f6' },
                    { name: 'Low', color: '#10b981' }
                ]
            },
            weekly: {
                name: 'Weekly Planning',
                lists: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekend', 'Next Week']
            }
        };
        
        this.swimlanes = [];
        this.wipLimits = {};
        this.cardSizes = { S: 1, M: 2, L: 3, XL: 5 };
    }
    
    // Apply a template to the current board
    async applyTemplate(templateName) {
        const template = this.templates[templateName];
        if (!template || !this.app.currentBoard) return;
        
        const confirmed = confirm(`Apply "${template.name}" template? This will replace existing lists.`);
        if (!confirmed) return;
        
        // Show loading
        this.app.showToast('Applying template...', 'info');
        
        // Create lists from template
        for (let i = 0; i < template.lists.length; i++) {
            await this.createList(template.lists[i], i);
        }
        
        // Apply WIP limits if any
        if (template.wipLimits) {
            this.wipLimits = template.wipLimits;
            this.applyWIPLimits();
        }
        
        // Create labels if any
        if (template.labels) {
            for (const label of template.labels) {
                await this.createLabel(label.name, label.color);
            }
        }
        
        this.app.showToast('Template applied successfully!', 'success');
        await this.app.loadBoard(this.app.currentBoard.id);
    }
    
    // Add swimlanes to board
    toggleSwimlanes() {
        const container = document.getElementById('listsContainer');
        if (container.classList.contains('swimlanes-enabled')) {
            container.classList.remove('swimlanes-enabled');
            this.removeSwimlanes();
        } else {
            container.classList.add('swimlanes-enabled');
            this.createSwimlanes();
        }
    }
    
    createSwimlanes() {
        const swimlaneNames = prompt('Enter swimlane names (comma-separated):');
        if (!swimlaneNames) return;
        
        this.swimlanes = swimlaneNames.split(',').map(s => s.trim());
        this.renderSwimlanes();
    }
    
    renderSwimlanes() {
        const container = document.getElementById('listsContainer');
        const lists = container.querySelectorAll('.list-column');
        
        // Create swimlane structure
        const swimlaneContainer = document.createElement('div');
        swimlaneContainer.className = 'swimlane-container';
        
        this.swimlanes.forEach((swimlane, index) => {
            const lane = document.createElement('div');
            lane.className = 'swimlane glass rounded-lg p-4 mb-4';
            lane.innerHTML = `
                <h3 class="text-sm font-bold mb-3 text-gray-600">${swimlane}</h3>
                <div class="swimlane-lists flex gap-3 overflow-x-auto" data-swimlane="${index}">
                    <!-- Lists will be cloned here -->
                </div>
            `;
            swimlaneContainer.appendChild(lane);
        });
        
        // Replace container content
        container.innerHTML = '';
        container.appendChild(swimlaneContainer);
    }
    
    // WIP Limits
    setWIPLimit(listName, limit) {
        this.wipLimits[listName] = limit;
        this.applyWIPLimits();
        this.saveWIPLimits();
    }
    
    applyWIPLimits() {
        document.querySelectorAll('.list-column').forEach(list => {
            const title = list.querySelector('h3')?.textContent;
            const limit = this.wipLimits[title];
            
            if (limit) {
                const cards = list.querySelectorAll('.card-item').length;
                const indicator = list.querySelector('.wip-indicator') || this.createWIPIndicator(list);
                
                indicator.textContent = `${cards}/${limit}`;
                indicator.className = `wip-indicator px-2 py-1 rounded text-xs font-bold ml-2 ${
                    cards > limit ? 'bg-red-500 text-white animate-pulse' : 
                    cards === limit ? 'bg-yellow-500 text-white' : 
                    'bg-green-500 text-white'
                }`;
                
                // Block adding cards if limit exceeded
                if (cards >= limit) {
                    list.classList.add('wip-limit-reached');
                } else {
                    list.classList.remove('wip-limit-reached');
                }
            }
        });
    }
    
    createWIPIndicator(list) {
        const indicator = document.createElement('span');
        indicator.className = 'wip-indicator';
        list.querySelector('.flex.justify-between')?.appendChild(indicator);
        return indicator;
    }
    
    // Card sizing for story points
    setCardSize(cardId, size) {
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (!card) return;
        
        const points = this.cardSizes[size] || 1;
        
        // Add size indicator
        let sizeIndicator = card.querySelector('.size-indicator');
        if (!sizeIndicator) {
            sizeIndicator = document.createElement('div');
            sizeIndicator.className = 'size-indicator absolute top-2 right-2';
            card.appendChild(sizeIndicator);
        }
        
        sizeIndicator.innerHTML = `
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">
                ${points}
            </span>
        `;
        
        // Add visual size difference
        card.classList.remove('card-size-s', 'card-size-m', 'card-size-l', 'card-size-xl');
        card.classList.add(`card-size-${size.toLowerCase()}`);
    }
    
    // Progress bars for cards with checklists
    updateCardProgress(cardId) {
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (!card) return;
        
        // Calculate progress (mock data for now)
        const totalItems = 5;
        const completedItems = 2;
        const progress = (completedItems / totalItems) * 100;
        
        // Add or update progress bar
        let progressBar = card.querySelector('.progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-2';
            card.querySelector('.p-2\\.5')?.appendChild(progressBar);
        }
        
        progressBar.innerHTML = `
            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" 
                 style="width: ${progress}%"></div>
        `;
    }
    
    // Due date warnings
    checkDueDates() {
        document.querySelectorAll('.card-item').forEach(card => {
            const dueDateElement = card.querySelector('[data-due-date]');
            if (!dueDateElement) return;
            
            const dueDate = new Date(dueDateElement.dataset.dueDate);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            card.classList.remove('due-soon', 'overdue', 'due-today');
            
            if (daysUntilDue < 0) {
                card.classList.add('overdue');
                this.addDueWarning(card, 'Überfällig!', 'red');
            } else if (daysUntilDue === 0) {
                card.classList.add('due-today');
                this.addDueWarning(card, 'Heute fällig!', 'orange');
            } else if (daysUntilDue <= 2) {
                card.classList.add('due-soon');
                this.addDueWarning(card, `In ${daysUntilDue} Tagen`, 'yellow');
            }
        });
    }
    
    addDueWarning(card, text, color) {
        let warning = card.querySelector('.due-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.className = 'due-warning absolute top-0 right-0 text-xs px-2 py-1 rounded-bl font-bold';
            card.appendChild(warning);
        }
        
        warning.textContent = text;
        warning.style.backgroundColor = color === 'red' ? '#ef4444' : 
                                       color === 'orange' ? '#f97316' : '#eab308';
        warning.style.color = 'white';
    }
    
    // Create helper methods
    async createList(name, position) {
        // This would call the API to create a list
        console.log(`Creating list: ${name} at position ${position}`);
    }
    
    async createLabel(name, color) {
        // This would call the API to create a label
        console.log(`Creating label: ${name} with color ${color}`);
    }
    
    saveWIPLimits() {
        localStorage.setItem('wipLimits', JSON.stringify(this.wipLimits));
    }
    
    loadWIPLimits() {
        const saved = localStorage.getItem('wipLimits');
        if (saved) {
            this.wipLimits = JSON.parse(saved);
            this.applyWIPLimits();
        }
    }
}