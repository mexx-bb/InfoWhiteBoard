# AI Build Prompt - TaskBoard Trello Clone

## Quick Build Command
"Build a complete Trello clone using Hono framework for Cloudflare Workers with TypeScript backend, Vanilla JavaScript frontend, Cloudflare D1 database, glassmorphism UI design, and full drag-and-drop functionality for 25 employees."

## Detailed Requirements

### Core Architecture
```
Backend: Hono + TypeScript + Cloudflare Workers
Frontend: Vanilla JavaScript + Tailwind CSS CDN
Database: Cloudflare D1 (SQLite)
Auth: JWT with Web Crypto API
Design: Glassmorphism with animations
```

### Essential Files to Create

#### 1. Backend Main File (src/index.tsx)
```typescript
- Import: Hono, cors, logger, serveStatic from hono/cloudflare-workers
- Auth endpoints: /api/auth/register, login, logout, me
- Board endpoints: CRUD for boards, lists, cards
- Middleware: JWT authentication
- Serve static files from /public
- HTML with glassmorphism styles
```

#### 2. Frontend Main (public/static/app.js)
```javascript
class TaskBoardApp {
  - Authentication (login/register)
  - Workspace management
  - Board/List/Card CRUD
  - Drag & drop with touch support
  - API calls with fetch
  - LocalStorage for token
}
```

#### 3. Advanced Features (5 separate JS files)
```
theme.js - ThemeManager class with 5 themes
board-features.js - BoardFeatures with templates
analytics.js - AnalyticsDashboard with metrics
gamification.js - GamificationSystem with XP/achievements
collaboration.js - CollaborationFeatures with rich editor
```

#### 4. Database Schema (migrations/001_schema.sql)
```sql
CREATE TABLE users (id, email, name, password_hash, role);
CREATE TABLE workspaces (id, name, owner_id);
CREATE TABLE boards (id, workspace_id, name, background_color);
CREATE TABLE lists (id, board_id, name, position);
CREATE TABLE cards (id, list_id, title, description, position, priority, due_date);
CREATE TABLE sessions (id, user_id, token, expires_at);
```

#### 5. Styles (public/static/style.css)
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}
```

### Key Features Required
1. ✅ JWT Authentication with role-based access
2. ✅ Drag & drop cards between lists
3. ✅ Mobile responsive with touch support
4. ✅ 5 theme options (light/dark/ocean/forest/sunset)
5. ✅ Analytics dashboard with charts
6. ✅ Gamification with XP and achievements
7. ✅ Enhanced card creator with priority/due dates
8. ✅ Board templates (Scrum/Kanban/Bug Tracking)
9. ✅ Glassmorphism design with animations
10. ✅ PWA with offline support

### API Structure
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login with JWT
GET /api/boards             - List boards
POST /api/boards            - Create board
GET /api/boards/:id         - Get board with lists/cards
POST /api/boards/:id/lists  - Create list
POST /api/lists/:id/cards   - Create card
PUT /api/cards/:id/move     - Move card (drag & drop)
```

### HTML Structure in index.tsx
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="/static/style.css" rel="stylesheet">
</head>
<body>
  <nav class="glass-nav">
    <button id="themeToggleBtn">🎨</button>
    <button id="analyticsBtn">📊</button>
    <button id="gamificationBtn">🏆</button>
  </nav>
  
  <div id="boardView">
    <!-- Lists with draggable cards -->
  </div>
  
  <script src="/static/app.js"></script>
  <script src="/static/theme.js"></script>
  <script src="/static/board-features.js"></script>
  <script src="/static/analytics.js"></script>
  <script src="/static/gamification.js"></script>
  <script src="/static/collaboration.js"></script>
</body>
</html>
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "wrangler pages dev dist --ip 0.0.0.0 --port 3000",
    "build": "vite build",
    "deploy": "wrangler pages deploy dist"
  },
  "dependencies": {
    "hono": "^4.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "wrangler": "^3.0.0",
    "vite": "^5.0.0"
  }
}
```

### Drag & Drop Implementation
```javascript
// In app.js
handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.innerHTML);
  this.draggedCard = e.target;
}

handleDrop(e) {
  const listId = e.target.closest('.list').dataset.listId;
  this.moveCard(this.draggedCard.id, listId);
}
```

### Test Accounts
```
Admin: admin@taskboard.com / admin123
User: max.mueller@company.de / test123
```

### Cloudflare Configuration (wrangler.jsonc)
```json
{
  "name": "taskboard",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "d1_databases": [{
    "binding": "DB",
    "database_name": "taskboard-production",
    "database_id": "your-id-here"
  }]
}
```

## Build Order
1. Create project structure
2. Setup package.json and install dependencies
3. Create database schema
4. Build backend API with Hono
5. Create frontend app.js with drag & drop
6. Add 5 feature modules
7. Style with glassmorphism
8. Test with sample data
9. Deploy to Cloudflare Pages

## GitHub Repository
https://github.com/mexx-bb/InfoWhiteBoard

## Success Metrics
- Supports 25+ concurrent users
- Drag & drop works smoothly
- Mobile responsive
- 5 themes available
- Analytics tracking works
- Achievements unlock properly
- All CRUD operations functional

## Important Notes
- Use `serveStatic` from 'hono/cloudflare-workers' NOT from '@hono/node-server'
- All static files must be in public/ folder
- Use Web Crypto API for JWT, not Node crypto
- No file system access at runtime (no fs module)
- 10MB size limit for Workers
- Must use Cloudflare services for persistence