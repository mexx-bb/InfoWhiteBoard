// Collaboration Features
class CollaborationFeatures {
    constructor(app) {
        this.app = app;
        this.mentions = [];
        this.reactions = ['👍', '❤️', '🎉', '🤔', '👀', '🚀'];
        this.initRichTextEditor();
    }
    
    // Enhanced card creator with rich text
    showEnhancedCardCreator(listId, callback) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass rounded-xl p-6 max-w-md w-full animate-fade-in">
                <h3 class="text-xl font-bold mb-4">Neue Karte erstellen</h3>
                <form id="enhancedCardForm">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Titel *</label>
                        <input type="text" id="cardTitle" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Karten-Titel">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Beschreibung</label>
                        <textarea id="cardDescription" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Detaillierte Beschreibung..."></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Priorität</label>
                        <select id="cardPriority" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="low">Niedrig</option>
                            <option value="medium" selected>Mittel</option>
                            <option value="high">Hoch</option>
                            <option value="critical">Kritisch</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Fälligkeitsdatum</label>
                        <input type="date" id="cardDueDate" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                            <i class="fas fa-plus mr-2"></i>Erstellen
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modal.querySelector('#enhancedCardForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const cardData = {
                title: modal.querySelector('#cardTitle').value,
                description: modal.querySelector('#cardDescription').value,
                priority: modal.querySelector('#cardPriority').value,
                due_date: modal.querySelector('#cardDueDate').value
            };
            modal.remove();
            callback(cardData);
        });
        
        document.body.appendChild(modal);
        modal.querySelector('#cardTitle').focus();
    }
    
    // Rich Text Editor for card descriptions
    initRichTextEditor() {
        // Add Quill or similar for rich text editing
        this.editorConfig = {
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'header': [1, 2, 3, false] }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            theme: 'snow'
        };
    }
    
    // Enhanced card detail modal with collaboration features
    showEnhancedCardModal(cardId) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <input type="text" value="Card Title" class="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 transition outline-none w-full">
                        <div class="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <span>in list <strong>In Progress</strong></span>
                            <span>•</span>
                            <span>Created by <strong>@maxmueller</strong></span>
                        </div>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-white/20 rounded-lg transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-3 gap-6">
                    <!-- Main Content -->
                    <div class="col-span-2 space-y-6">
                        <!-- Description with Rich Text -->
                        <div>
                            <h3 class="font-semibold mb-2 flex items-center">
                                <i class="fas fa-align-left mr-2"></i>Description
                            </h3>
                            <div id="richTextEditor" class="min-h-[150px] p-3 glass rounded-lg">
                                <!-- Rich text editor would be initialized here -->
                                <div contenteditable="true" class="outline-none" placeholder="Add a more detailed description...">
                                    Click to edit with <strong>rich text</strong>, add <em>formatting</em>, and @mention teammates
                                </div>
                            </div>
                        </div>
                        
                        <!-- Attachments -->
                        <div>
                            <h3 class="font-semibold mb-2 flex items-center">
                                <i class="fas fa-paperclip mr-2"></i>Attachments
                            </h3>
                            <div class="space-y-2">
                                ${this.renderAttachments()}
                            </div>
                            <button class="mt-2 glass px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm">
                                <i class="fas fa-plus mr-2"></i>Add attachment
                            </button>
                        </div>
                        
                        <!-- Activity & Comments -->
                        <div>
                            <h3 class="font-semibold mb-2 flex items-center">
                                <i class="fas fa-comment mr-2"></i>Activity
                            </h3>
                            <div class="space-y-3">
                                ${this.renderComments()}
                            </div>
                            
                            <!-- New Comment Input -->
                            <div class="mt-4 flex gap-2">
                                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                                    U
                                </div>
                                <div class="flex-1">
                                    <div class="glass rounded-lg p-3">
                                        <textarea 
                                            placeholder="Write a comment... Use @ to mention someone" 
                                            class="w-full bg-transparent outline-none resize-none"
                                            onkeyup="collaboration.handleMention(this)"
                                        ></textarea>
                                        <div class="flex justify-between items-center mt-2">
                                            <div class="flex gap-1">
                                                ${this.reactions.map(emoji => `
                                                    <button class="p-1 hover:bg-white/20 rounded transition">${emoji}</button>
                                                `).join('')}
                                            </div>
                                            <button class="btn-glass text-white px-3 py-1 rounded text-sm">
                                                Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sidebar -->
                    <div class="space-y-4">
                        <!-- Quick Actions -->
                        <div class="glass rounded-lg p-4">
                            <h4 class="font-semibold mb-3">Actions</h4>
                            <div class="space-y-2">
                                <button class="w-full text-left p-2 hover:bg-white/20 rounded transition text-sm">
                                    <i class="fas fa-user-plus mr-2"></i>Add Members
                                </button>
                                <button class="w-full text-left p-2 hover:bg-white/20 rounded transition text-sm">
                                    <i class="fas fa-tags mr-2"></i>Add Labels
                                </button>
                                <button class="w-full text-left p-2 hover:bg-white/20 rounded transition text-sm">
                                    <i class="fas fa-clock mr-2"></i>Set Due Date
                                </button>
                                <button class="w-full text-left p-2 hover:bg-white/20 rounded transition text-sm">
                                    <i class="fas fa-copy mr-2"></i>Duplicate Card
                                </button>
                                <button class="w-full text-left p-2 hover:bg-white/20 rounded transition text-sm text-red-500">
                                    <i class="fas fa-trash mr-2"></i>Delete Card
                                </button>
                            </div>
                        </div>
                        
                        <!-- Members -->
                        <div class="glass rounded-lg p-4">
                            <h4 class="font-semibold mb-3">Members</h4>
                            <div class="flex -space-x-2">
                                <div class="w-8 h-8 bg-blue-500 rounded-full ring-2 ring-white flex items-center justify-center text-white text-xs">
                                    MM
                                </div>
                                <div class="w-8 h-8 bg-green-500 rounded-full ring-2 ring-white flex items-center justify-center text-white text-xs">
                                    AS
                                </div>
                                <button class="w-8 h-8 bg-gray-200 rounded-full ring-2 ring-white flex items-center justify-center text-gray-600 text-xs hover:bg-gray-300 transition">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Labels -->
                        <div class="glass rounded-lg p-4">
                            <h4 class="font-semibold mb-3">Labels</h4>
                            <div class="flex flex-wrap gap-2">
                                <span class="px-3 py-1 bg-red-500 text-white rounded-full text-xs">Urgent</span>
                                <span class="px-3 py-1 bg-blue-500 text-white rounded-full text-xs">Feature</span>
                                <button class="px-3 py-1 bg-gray-200 rounded-full text-xs hover:bg-gray-300 transition">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Due Date -->
                        <div class="glass rounded-lg p-4">
                            <h4 class="font-semibold mb-3">Due Date</h4>
                            <input type="datetime-local" class="w-full p-2 glass rounded text-sm">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    renderAttachments() {
        const attachments = [
            { name: 'mockup.png', size: '2.4 MB', type: 'image', url: '#' },
            { name: 'requirements.pdf', size: '1.2 MB', type: 'pdf', url: '#' }
        ];
        
        return attachments.map(att => `
            <div class="glass rounded-lg p-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fas fa-${att.type === 'image' ? 'image' : 'file-pdf'} text-2xl text-gray-600"></i>
                    <div>
                        <div class="font-medium text-sm">${att.name}</div>
                        <div class="text-xs text-gray-600">${att.size}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="p-1 hover:bg-white/20 rounded transition">
                        <i class="fas fa-download text-sm"></i>
                    </button>
                    <button class="p-1 hover:bg-white/20 rounded transition">
                        <i class="fas fa-trash text-sm text-red-500"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderComments() {
        const comments = [
            {
                user: 'Anna Schmidt',
                avatar: 'AS',
                time: '2 hours ago',
                text: 'I think we should prioritize this for the next sprint. @maxmueller what do you think?',
                reactions: [{ emoji: '👍', count: 3 }, { emoji: '🎉', count: 1 }]
            },
            {
                user: 'Max Müller',
                avatar: 'MM',
                time: '1 hour ago',
                text: 'Agreed! I can start working on this tomorrow.',
                reactions: [{ emoji: '🚀', count: 2 }]
            }
        ];
        
        return comments.map(comment => `
            <div class="flex gap-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                    ${comment.avatar}
                </div>
                <div class="flex-1">
                    <div class="glass rounded-lg p-3">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-semibold text-sm">${comment.user}</span>
                            <span class="text-xs text-gray-500">${comment.time}</span>
                        </div>
                        <div class="text-sm mb-2">${comment.text}</div>
                        <div class="flex items-center gap-2">
                            ${comment.reactions.map(r => `
                                <button class="glass px-2 py-1 rounded text-xs hover:scale-110 transition">
                                    ${r.emoji} ${r.count}
                                </button>
                            `).join('')}
                            <button class="text-xs text-gray-500 hover:text-gray-700">
                                <i class="fas fa-smile mr-1"></i>React
                            </button>
                            <button class="text-xs text-gray-500 hover:text-gray-700">
                                <i class="fas fa-reply mr-1"></i>Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // @Mention functionality
    handleMention(input) {
        const text = input.value;
        const lastAtIndex = text.lastIndexOf('@');
        
        if (lastAtIndex !== -1 && lastAtIndex === text.length - 1 || 
            (lastAtIndex !== -1 && text[lastAtIndex + 1] && text[lastAtIndex + 1] !== ' ')) {
            
            const searchTerm = text.substring(lastAtIndex + 1);
            this.showMentionSuggestions(input, searchTerm);
        } else {
            this.hideMentionSuggestions();
        }
    }
    
    showMentionSuggestions(input, searchTerm) {
        const users = [
            { id: 'user-001', name: 'Max Müller', avatar: 'MM' },
            { id: 'user-002', name: 'Anna Schmidt', avatar: 'AS' },
            { id: 'user-003', name: 'Thomas Weber', avatar: 'TW' }
        ];
        
        const filtered = users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filtered.length === 0) {
            this.hideMentionSuggestions();
            return;
        }
        
        let suggestions = document.getElementById('mentionSuggestions');
        if (!suggestions) {
            suggestions = document.createElement('div');
            suggestions.id = 'mentionSuggestions';
            suggestions.className = 'absolute glass rounded-lg shadow-xl z-50';
            document.body.appendChild(suggestions);
        }
        
        const rect = input.getBoundingClientRect();
        suggestions.style.left = rect.left + 'px';
        suggestions.style.top = (rect.bottom + 5) + 'px';
        suggestions.style.width = rect.width + 'px';
        
        suggestions.innerHTML = filtered.map(user => `
            <div class="p-2 hover:bg-white/20 cursor-pointer transition flex items-center gap-2"
                 onclick="collaboration.insertMention('${user.name}', '${input.id}')">
                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    ${user.avatar}
                </div>
                <span class="text-sm">${user.name}</span>
            </div>
        `).join('');
    }
    
    hideMentionSuggestions() {
        const suggestions = document.getElementById('mentionSuggestions');
        if (suggestions) {
            suggestions.remove();
        }
    }
    
    insertMention(userName, inputId) {
        const input = document.getElementById(inputId);
        const text = input.value;
        const lastAtIndex = text.lastIndexOf('@');
        
        input.value = text.substring(0, lastAtIndex) + '@' + userName + ' ';
        this.hideMentionSuggestions();
        input.focus();
    }
    
    // Thread discussions
    createThread(commentId) {
        const thread = document.createElement('div');
        thread.className = 'ml-11 mt-2 space-y-2';
        thread.id = `thread-${commentId}`;
        
        // Add thread replies here
        
        return thread;
    }
    
    // File preview
    showFilePreview(fileUrl, fileType) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
        
        if (fileType === 'image') {
            modal.innerHTML = `
                <div class="relative">
                    <img src="${fileUrl}" class="max-w-full max-h-[90vh] rounded-lg">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="absolute top-4 right-4 p-2 glass rounded-full text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            modal.innerHTML = `
                <div class="glass rounded-lg p-6 max-w-2xl w-full">
                    <iframe src="${fileUrl}" class="w-full h-96"></iframe>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="mt-4 w-full btn-glass text-white py-2 rounded-lg">
                        Close
                    </button>
                </div>
            `;
        }
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}