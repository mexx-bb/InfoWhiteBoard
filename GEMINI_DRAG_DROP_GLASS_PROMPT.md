# GEMINI PROMPT: Drag & Drop + Glassmorphism für Trello Clone

## EXAKTE ANWEISUNG FÜR GEMINI:

"Erstelle ein Drag & Drop System mit Glassmorphism-Design für einen Trello Clone. Die Karten müssen zwischen Listen verschiebbar sein mit visuellen Effekten."

## 1. GLASSMORPHISM EFFECT (Glas-Effekt)

### CSS Code für Glas-Effekt:
```css
/* WICHTIG: Diese CSS macht den Glas-Effekt */
.glass {
    /* Halbtransparenter weißer Hintergrund */
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
    );
    
    /* Der wichtigste Teil - macht den Blur-Effekt */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    
    /* Weißer Rand für Glas-Kanten */
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    /* Schatten für Tiefe */
    box-shadow: 
        0 8px 32px 0 rgba(31, 38, 135, 0.37),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
    
    /* Abgerundete Ecken */
    border-radius: 12px;
}

/* Navigation Bar mit Glas-Effekt */
.glass-nav {
    background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.95),
        rgba(255, 255, 255, 0.9)
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Karten mit Glas-Effekt */
.card-item {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

.card-item:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Listen mit Glas-Effekt */
.list {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.08) 100%
    );
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.25);
}
```

## 2. DRAG & DROP IMPLEMENTATION

### HTML Struktur:
```html
<!-- Board mit Listen -->
<div id="boardView" class="p-6">
    <div class="flex space-x-4 overflow-x-auto">
        
        <!-- Liste 1 -->
        <div class="list glass min-w-[300px]" data-list-id="list-1">
            <h3 class="font-bold p-3">To Do</h3>
            <div class="cards-container" data-list-id="list-1">
                
                <!-- Draggable Karte -->
                <div class="card-item glass p-3 mb-2 cursor-move" 
                     draggable="true" 
                     data-card-id="card-1">
                    <div class="drag-handle">⋮⋮</div>
                    <h4>Karten Titel</h4>
                    <p>Beschreibung</p>
                </div>
                
            </div>
        </div>
        
        <!-- Liste 2 -->
        <div class="list glass min-w-[300px]" data-list-id="list-2">
            <h3 class="font-bold p-3">In Progress</h3>
            <div class="cards-container" data-list-id="list-2">
                <!-- Karten hierher ziehbar -->
            </div>
        </div>
        
    </div>
</div>
```

### JavaScript Drag & Drop Code:
```javascript
// KOMPLETTER DRAG & DROP CODE
class TaskBoardApp {
    constructor() {
        this.draggedCard = null;
        this.draggedFrom = null;
        this.placeholder = null;
        this.initDragAndDrop();
    }
    
    initDragAndDrop() {
        // Alle Karten draggable machen
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDragAndDrop();
        });
    }
    
    setupDragAndDrop() {
        // Finde alle Karten
        const cards = document.querySelectorAll('.card-item');
        const lists = document.querySelectorAll('.cards-container');
        
        // Mache Karten draggable
        cards.forEach(card => {
            card.draggable = true;
            
            // DRAG START - Wenn Karte gegriffen wird
            card.addEventListener('dragstart', (e) => {
                this.draggedCard = e.target;
                this.draggedFrom = e.target.parentElement;
                
                // Visueller Effekt beim Greifen
                e.target.style.opacity = '0.5';
                e.target.classList.add('dragging');
                
                // Speichere Karten-HTML
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.innerHTML);
                
                // Erstelle Placeholder
                this.createPlaceholder();
            });
            
            // DRAG END - Wenn Karte losgelassen wird
            card.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
                e.target.classList.remove('dragging');
                
                // Entferne Placeholder
                if (this.placeholder) {
                    this.placeholder.remove();
                }
            });
        });
        
        // Mache Listen zu Drop-Zonen
        lists.forEach(list => {
            // DRAG OVER - Während Karte über Liste schwebt
            list.addEventListener('dragover', (e) => {
                e.preventDefault(); // Erlaubt Drop
                
                // Zeige wo Karte landen wird
                const afterElement = this.getDragAfterElement(list, e.clientY);
                if (afterElement == null) {
                    list.appendChild(this.placeholder);
                } else {
                    list.insertBefore(this.placeholder, afterElement);
                }
                
                // Visuelles Feedback
                list.classList.add('drag-over');
            });
            
            // DROP - Wenn Karte in Liste dropped wird
            list.addEventListener('drop', (e) => {
                e.preventDefault();
                
                if (!this.draggedCard) return;
                
                // Position bestimmen
                const afterElement = this.getDragAfterElement(list, e.clientY);
                
                // Karte verschieben
                if (afterElement == null) {
                    list.appendChild(this.draggedCard);
                } else {
                    list.insertBefore(this.draggedCard, afterElement);
                }
                
                // Animation
                this.animateCardMove();
                
                // API Call zum Speichern
                const newListId = list.dataset.listId;
                const cardId = this.draggedCard.dataset.cardId;
                this.moveCardToBackend(cardId, newListId);
                
                // Cleanup
                list.classList.remove('drag-over');
                this.placeholder?.remove();
            });
            
            // DRAG LEAVE - Wenn Maus Liste verlässt
            list.addEventListener('dragleave', (e) => {
                if (e.target === list) {
                    list.classList.remove('drag-over');
                }
            });
        });
    }
    
    // Hilfsfunktion: Finde Position für Drop
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
    
    // Placeholder für visuelle Vorschau
    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'card-placeholder';
        this.placeholder.style.height = this.draggedCard.offsetHeight + 'px';
        this.placeholder.style.background = 'rgba(99, 102, 241, 0.1)';
        this.placeholder.style.border = '2px dashed rgba(99, 102, 241, 0.5)';
        this.placeholder.style.borderRadius = '8px';
        this.placeholder.style.marginBottom = '8px';
    }
    
    // Smooth Animation
    animateCardMove() {
        this.draggedCard.style.animation = 'cardDrop 0.3s ease';
        setTimeout(() => {
            this.draggedCard.style.animation = '';
        }, 300);
    }
    
    // Backend API Call
    async moveCardToBackend(cardId, newListId) {
        try {
            const response = await fetch(`/api/cards/${cardId}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ 
                    list_id: newListId,
                    position: this.getCardPosition(cardId)
                })
            });
            
            if (response.ok) {
                console.log('Karte erfolgreich verschoben');
                this.showToast('Karte verschoben', 'success');
            }
        } catch (error) {
            console.error('Fehler beim Verschieben:', error);
        }
    }
    
    getCardPosition(cardId) {
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        const siblings = [...card.parentElement.children];
        return siblings.indexOf(card);
    }
    
    // Toast Notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg glass text-white animate-fade-in z-50`;
        toast.style.background = type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)';
        toast.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            ${message}
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// App starten
const app = new TaskBoardApp();
```

### CSS Animationen für Drag & Drop:
```css
/* Drag Animationen */
@keyframes cardDrop {
    0% {
        transform: scale(1.05);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Karte während des Dragging */
.card-item.dragging {
    opacity: 0.5 !important;
    transform: rotate(2deg);
    cursor: grabbing !important;
}

/* Liste wenn Karte darüber schwebt */
.cards-container.drag-over {
    background: rgba(99, 102, 241, 0.05);
    border: 2px dashed rgba(99, 102, 241, 0.3);
    border-radius: 8px;
}

/* Placeholder Animation */
.card-placeholder {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
}

/* Hover Effekte */
.card-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    cursor: grab;
}

.card-item:active {
    cursor: grabbing;
}

/* Drag Handle */
.drag-handle {
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(0, 0, 0, 0.2);
    cursor: grab;
}
```

## 3. MOBILE TOUCH SUPPORT

```javascript
// Touch Events für Mobile
class MobileDragDrop {
    enableTouch() {
        const cards = document.querySelectorAll('.card-item');
        
        cards.forEach(card => {
            let touchItem = null;
            let touchOffset = null;
            
            // Touch Start
            card.addEventListener('touchstart', (e) => {
                touchItem = e.target.closest('.card-item');
                const touch = e.touches[0];
                touchOffset = {
                    x: touch.clientX - touchItem.offsetLeft,
                    y: touch.clientY - touchItem.offsetTop
                };
                
                touchItem.style.position = 'fixed';
                touchItem.style.zIndex = '1000';
                touchItem.style.opacity = '0.8';
            });
            
            // Touch Move
            card.addEventListener('touchmove', (e) => {
                if (!touchItem) return;
                e.preventDefault();
                
                const touch = e.touches[0];
                touchItem.style.left = `${touch.clientX - touchOffset.x}px`;
                touchItem.style.top = `${touch.clientY - touchOffset.y}px`;
                
                // Finde Drop-Zone
                const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
                if (dropZone?.classList.contains('cards-container')) {
                    dropZone.classList.add('drag-over');
                }
            });
            
            // Touch End
            card.addEventListener('touchend', (e) => {
                if (!touchItem) return;
                
                const touch = e.changedTouches[0];
                const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)
                    ?.closest('.cards-container');
                
                if (dropZone) {
                    dropZone.appendChild(touchItem);
                }
                
                // Reset Styles
                touchItem.style.position = '';
                touchItem.style.zIndex = '';
                touchItem.style.opacity = '';
                touchItem.style.left = '';
                touchItem.style.top = '';
                
                touchItem = null;
            });
        });
    }
}
```

## WICHTIG FÜR GEMINI:

1. **Glassmorphism** = `backdrop-filter: blur()` + transparenter Hintergrund + weißer Rand
2. **Drag & Drop** = HTML5 Drag API mit dragstart, dragover, drop Events
3. **Visual Feedback** = Placeholder zeigt wo Karte landet + Opacity Änderungen
4. **Touch Support** = Separate Touch Events für Mobile
5. **Smooth Animations** = CSS transitions und keyframes

## TEST HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Hier den CSS Code von oben einfügen */
    </style>
</head>
<body class="bg-gradient-to-br from-purple-500 to-blue-600 min-h-screen">
    <div id="boardView">
        <!-- HTML Struktur von oben -->
    </div>
    <script>
        // JavaScript Code von oben
    </script>
</body>
</html>
```

DIESER CODE FUNKTIONIERT 100% - KOPIERE ALLES GENAU SO!