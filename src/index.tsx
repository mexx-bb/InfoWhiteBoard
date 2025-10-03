import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/cloudflare-workers';
import { nanoid } from 'nanoid';

import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from './middleware/auth';
import { createSession, revokeSession, Password } from './lib/auth';
import type { User, Board, List, Card, Workspace } from './types';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  SESSION_DURATION: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('/api/*', cors());
app.use('/api/*', logger());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// ============= AUTH ENDPOINTS =============

// Register
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    const db = c.env.DB;
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }
    
    // Check if user exists
    const existing = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existing) {
      return c.json({ error: 'Email already registered' }, 400);
    }
    
    // Hash password
    const passwordHash = await Password.hash(password);
    const userId = nanoid();
    
    // Create user
    await db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, 'member')
    `).bind(userId, email, passwordHash, name).run();
    
    // Get created user (without password)
    const userRecord = await db.prepare(`
      SELECT id, email, name, role, avatar_url, is_active, created_at, updated_at 
      FROM users WHERE id = ?
    `).bind(userId).first();
    
    const user: User = {
      id: userRecord?.id as string,
      email: userRecord?.email as string,
      name: userRecord?.name as string,
      role: userRecord?.role as 'admin' | 'member' | 'observer',
      avatar_url: userRecord?.avatar_url as string | undefined,
      is_active: userRecord?.is_active as boolean,
      created_at: userRecord?.created_at as string,
      updated_at: userRecord?.updated_at as string
    };
    
    // Create session
    const { token, session } = await createSession(
      db, 
      user, 
      c.env.JWT_SECRET,
      parseInt(c.env.SESSION_DURATION || '86400')
    );
    
    return c.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Login
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // Get user with password hash
    const userRecord = await db.prepare(`
      SELECT * FROM users WHERE email = ? AND is_active = true
    `).bind(email).first();
    
    if (!userRecord) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Verify password
    const isValid = await Password.verify(password, userRecord.password_hash as string);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Create user object without password
    const user: User = {
      id: userRecord.id as string,
      email: userRecord.email as string,
      name: userRecord.name as string,
      role: userRecord.role as 'admin' | 'member' | 'observer',
      avatar_url: userRecord.avatar_url as string | undefined,
      is_active: userRecord.is_active as boolean,
      created_at: userRecord.created_at as string,
      updated_at: userRecord.updated_at as string
    };
    
    // Create session
    const { token, session } = await createSession(
      db,
      user,
      c.env.JWT_SECRET,
      parseInt(c.env.SESSION_DURATION || '86400')
    );
    
    return c.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Logout
app.post('/api/auth/logout', authMiddleware, async (c) => {
  const session = c.get('session');
  const db = c.env.DB;
  
  if (session) {
    await revokeSession(db, session.token);
  }
  
  return c.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// ============= WORKSPACE ENDPOINTS =============

// Get user's workspaces
app.get('/api/workspaces', authMiddleware, async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  
  const workspaces = await db.prepare(`
    SELECT w.* FROM workspaces w
    JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = ?
    ORDER BY w.created_at DESC
  `).bind(user.id).all();
  
  return c.json({ workspaces: workspaces.results });
});

// Create workspace
app.post('/api/workspaces', authMiddleware, async (c) => {
  const user = c.get('user');
  const { name, description } = await c.req.json();
  const db = c.env.DB;
  
  const workspaceId = nanoid();
  
  // Create workspace
  await db.prepare(`
    INSERT INTO workspaces (id, name, description, owner_id)
    VALUES (?, ?, ?, ?)
  `).bind(workspaceId, name, description, user.id).run();
  
  // Add owner as admin member
  await db.prepare(`
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (?, ?, 'admin')
  `).bind(workspaceId, user.id).run();
  
  const workspace = await db.prepare(
    'SELECT * FROM workspaces WHERE id = ?'
  ).bind(workspaceId).first();
  
  return c.json({ workspace });
});

// ============= BOARD ENDPOINTS =============

// Get boards in workspace
app.get('/api/workspaces/:workspaceId/boards', authMiddleware, async (c) => {
  const workspaceId = c.req.param('workspaceId');
  const user = c.get('user');
  const db = c.env.DB;
  
  // Check if user has access to workspace
  const member = await db.prepare(`
    SELECT * FROM workspace_members 
    WHERE workspace_id = ? AND user_id = ?
  `).bind(workspaceId, user.id).first();
  
  if (!member) {
    return c.json({ error: 'Access denied' }, 403);
  }
  
  const boards = await db.prepare(`
    SELECT * FROM boards 
    WHERE workspace_id = ? AND is_archived = false
    ORDER BY created_at DESC
  `).bind(workspaceId).all();
  
  return c.json({ boards: boards.results });
});

// Create board
app.post('/api/boards', authMiddleware, async (c) => {
  const user = c.get('user');
  const { workspace_id, name, description, background_color } = await c.req.json();
  const db = c.env.DB;
  
  const boardId = nanoid();
  
  await db.prepare(`
    INSERT INTO boards (id, workspace_id, name, description, background_color, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(boardId, workspace_id, name, description, background_color || '#0079BF', user.id).run();
  
  // Add creator as board admin
  await db.prepare(`
    INSERT INTO board_members (board_id, user_id, role)
    VALUES (?, ?, 'admin')
  `).bind(boardId, user.id).run();
  
  // Create default lists
  const defaultLists = ['To Do', 'In Progress', 'Done'];
  for (let i = 0; i < defaultLists.length; i++) {
    const listId = nanoid();
    await db.prepare(`
      INSERT INTO lists (id, board_id, name, position)
      VALUES (?, ?, ?, ?)
    `).bind(listId, boardId, defaultLists[i], i).run();
  }
  
  const board = await db.prepare(
    'SELECT * FROM boards WHERE id = ?'
  ).bind(boardId).first();
  
  return c.json({ board });
});

// Get board with lists and cards
app.get('/api/boards/:boardId', authMiddleware, async (c) => {
  const boardId = c.req.param('boardId');
  const user = c.get('user');
  const db = c.env.DB;
  
  // Get board
  const board = await db.prepare(
    'SELECT * FROM boards WHERE id = ?'
  ).bind(boardId).first() as Board;
  
  if (!board) {
    return c.json({ error: 'Board not found' }, 404);
  }
  
  // Check access
  const member = await db.prepare(`
    SELECT * FROM board_members 
    WHERE board_id = ? AND user_id = ?
  `).bind(boardId, user.id).first();
  
  if (!member && !board.is_public) {
    return c.json({ error: 'Access denied' }, 403);
  }
  
  // Get lists with cards
  const lists = await db.prepare(`
    SELECT * FROM lists 
    WHERE board_id = ? AND is_archived = false
    ORDER BY position
  `).bind(boardId).all();
  
  // Get cards for each list
  for (const list of lists.results) {
    const cards = await db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM comments WHERE card_id = c.id) as comments_count,
        (SELECT COUNT(*) FROM attachments WHERE card_id = c.id) as attachments_count
      FROM cards c
      WHERE c.list_id = ? AND c.is_archived = false
      ORDER BY c.position
    `).bind(list.id).all();
    
    // Get members for each card
    for (const card of cards.results) {
      const members = await db.prepare(`
        SELECT u.id, u.name, u.email, u.avatar_url
        FROM users u
        JOIN card_members cm ON u.id = cm.user_id
        WHERE cm.card_id = ?
      `).bind(card.id).all();
      
      card.members = members.results;
      
      // Get labels
      const labels = await db.prepare(`
        SELECT l.* FROM labels l
        JOIN card_labels cl ON l.id = cl.label_id
        WHERE cl.card_id = ?
      `).bind(card.id).all();
      
      card.labels = labels.results;
    }
    
    list.cards = cards.results;
  }
  
  // Get board members
  const members = await db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar_url, bm.role
    FROM users u
    JOIN board_members bm ON u.id = bm.user_id
    WHERE bm.board_id = ?
  `).bind(boardId).all();
  
  return c.json({
    board,
    lists: lists.results,
    members: members.results
  });
});

// ============= LIST ENDPOINTS =============

// Create list
app.post('/api/boards/:boardId/lists', authMiddleware, async (c) => {
  const boardId = c.req.param('boardId');
  const { name, position } = await c.req.json();
  const db = c.env.DB;
  
  const listId = nanoid();
  
  await db.prepare(`
    INSERT INTO lists (id, board_id, name, position)
    VALUES (?, ?, ?, ?)
  `).bind(listId, boardId, name, position).run();
  
  const list = await db.prepare(
    'SELECT * FROM lists WHERE id = ?'
  ).bind(listId).first();
  
  return c.json({ list });
});

// Update list
app.put('/api/lists/:listId', authMiddleware, async (c) => {
  const listId = c.req.param('listId');
  const { name, position } = await c.req.json();
  const db = c.env.DB;
  
  await db.prepare(`
    UPDATE lists 
    SET name = COALESCE(?, name),
        position = COALESCE(?, position),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(name, position, listId).run();
  
  const list = await db.prepare(
    'SELECT * FROM lists WHERE id = ?'
  ).bind(listId).first();
  
  return c.json({ list });
});

// ============= CARD ENDPOINTS =============

// Create card
app.post('/api/lists/:listId/cards', authMiddleware, async (c) => {
  const listId = c.req.param('listId');
  const user = c.get('user');
  const { title, description, position } = await c.req.json();
  const db = c.env.DB;
  
  const cardId = nanoid();
  
  await db.prepare(`
    INSERT INTO cards (id, list_id, title, description, position, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(cardId, listId, title, description, position, user.id).run();
  
  const card = await db.prepare(
    'SELECT * FROM cards WHERE id = ?'
  ).bind(cardId).first();
  
  return c.json({ card });
});

// Move card
app.put('/api/cards/:cardId/move', authMiddleware, async (c) => {
  const cardId = c.req.param('cardId');
  const { list_id, position } = await c.req.json();
  const db = c.env.DB;
  
  await db.prepare(`
    UPDATE cards 
    SET list_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(list_id, position, cardId).run();
  
  const card = await db.prepare(
    'SELECT * FROM cards WHERE id = ?'
  ).bind(cardId).first();
  
  return c.json({ card });
});

// Update card
app.put('/api/cards/:cardId', authMiddleware, async (c) => {
  const cardId = c.req.param('cardId');
  const updates = await c.req.json();
  const db = c.env.DB;
  
  // Build dynamic update query
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(updates.due_date);
  }
  if (updates.is_completed !== undefined) {
    fields.push('is_completed = ?');
    values.push(updates.is_completed);
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(cardId);
    
    await db.prepare(`
      UPDATE cards SET ${fields.join(', ')} WHERE id = ?
    `).bind(...values).run();
  }
  
  const card = await db.prepare(
    'SELECT * FROM cards WHERE id = ?'
  ).bind(cardId).first();
  
  return c.json({ card });
});

// ============= ADMIN ENDPOINTS =============

// Get all users (admin only)
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (c) => {
  const db = c.env.DB;
  
  const users = await db.prepare(`
    SELECT id, email, name, role, is_active, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `).all();
  
  return c.json({ users: users.results });
});

// Update user role (admin only)
app.put('/api/admin/users/:userId/role', authMiddleware, adminMiddleware, async (c) => {
  const userId = c.req.param('userId');
  const { role } = await c.req.json();
  const db = c.env.DB;
  
  if (!['admin', 'member', 'observer'].includes(role)) {
    return c.json({ error: 'Invalid role' }, 400);
  }
  
  await db.prepare(`
    UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(role, userId).run();
  
  return c.json({ success: true });
});

// Deactivate user (admin only)
app.put('/api/admin/users/:userId/deactivate', authMiddleware, adminMiddleware, async (c) => {
  const userId = c.req.param('userId');
  const db = c.env.DB;
  
  await db.prepare(`
    UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(userId).run();
  
  // Revoke all sessions
  await db.prepare(`
    DELETE FROM sessions WHERE user_id = ?
  `).bind(userId).run();
  
  return c.json({ success: true });
});

// Get activity logs (admin only)
app.get('/api/admin/activity', authMiddleware, adminMiddleware, async (c) => {
  const db = c.env.DB;
  const { workspace_id, board_id, user_id, limit = 100 } = c.req.query();
  
  let query = `
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (workspace_id) {
    query += ' AND al.workspace_id = ?';
    params.push(workspace_id);
  }
  if (board_id) {
    query += ' AND al.board_id = ?';
    params.push(board_id);
  }
  if (user_id) {
    query += ' AND al.user_id = ?';
    params.push(user_id);
  }
  
  query += ' ORDER BY al.created_at DESC LIMIT ?';
  params.push(limit);
  
  const logs = await db.prepare(query).bind(...params).all();
  
  return c.json({ logs: logs.results });
});

// ============= FRONTEND =============

// Serve the main application
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskBoard - Team Collaboration</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .drag-over { background-color: #f3f4f6; }
        .dragging { opacity: 0.5; }
        .card-shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
        .board-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-tasks text-2xl text-indigo-600 mr-3"></i>
                        <h1 class="text-xl font-bold text-gray-900">TaskBoard</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="createBoardBtn" class="hidden bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            <i class="fas fa-plus mr-2"></i>Neues Board
                        </button>
                        <div id="userMenu" class="hidden relative">
                            <button class="flex items-center space-x-2">
                                <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                    <i class="fas fa-user"></i>
                                </div>
                                <span id="userName" class="text-gray-700"></span>
                            </button>
                        </div>
                        <button id="logoutBtn" class="hidden text-gray-600 hover:text-gray-900">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main id="mainContent" class="py-8">
            <!-- Login Form -->
            <div id="loginView" class="max-w-md mx-auto px-4">
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold mb-6 text-center">Anmelden</h2>
                    <form id="loginForm">
                        <div class="mb-4">
                            <label class="block text-gray-700 mb-2">E-Mail</label>
                            <input type="email" id="loginEmail" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div class="mb-6">
                            <label class="block text-gray-700 mb-2">Passwort</label>
                            <input type="password" id="loginPassword" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                            Anmelden
                        </button>
                    </form>
                    <p class="mt-4 text-center text-sm text-gray-600">
                        Noch kein Konto? <button id="showRegisterBtn" class="text-indigo-600 hover:underline">Registrieren</button>
                    </p>
                    <div class="mt-4 p-3 bg-blue-50 rounded text-sm">
                        <p class="font-semibold">Test-Zugänge:</p>
                        <p>Admin: admin@taskboard.com / admin123</p>
                        <p>User: max.mueller@company.de / test123</p>
                    </div>
                </div>
            </div>

            <!-- Register Form -->
            <div id="registerView" class="hidden max-w-md mx-auto px-4">
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold mb-6 text-center">Registrieren</h2>
                    <form id="registerForm">
                        <div class="mb-4">
                            <label class="block text-gray-700 mb-2">Name</label>
                            <input type="text" id="registerName" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 mb-2">E-Mail</label>
                            <input type="email" id="registerEmail" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div class="mb-6">
                            <label class="block text-gray-700 mb-2">Passwort</label>
                            <input type="password" id="registerPassword" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                            Registrieren
                        </button>
                    </form>
                    <p class="mt-4 text-center text-sm text-gray-600">
                        Bereits registriert? <button id="showLoginBtn" class="text-indigo-600 hover:underline">Anmelden</button>
                    </p>
                </div>
            </div>

            <!-- Board View -->
            <div id="boardView" class="hidden">
                <div class="board-bg min-h-screen">
                    <div class="px-4 py-4">
                        <div class="flex items-center justify-between mb-6 text-white">
                            <h2 id="boardTitle" class="text-2xl font-bold"></h2>
                            <div class="flex space-x-2">
                                <button id="addListBtn" class="bg-white/20 backdrop-blur px-4 py-2 rounded hover:bg-white/30">
                                    <i class="fas fa-plus mr-2"></i>Liste hinzufügen
                                </button>
                            </div>
                        </div>
                        
                        <div id="listsContainer" class="flex space-x-4 overflow-x-auto pb-4">
                            <!-- Lists will be dynamically added here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Workspace View -->
            <div id="workspaceView" class="hidden max-w-7xl mx-auto px-4">
                <h2 class="text-2xl font-bold mb-6">Meine Arbeitsbereiche</h2>
                <div id="workspacesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Workspaces will be dynamically added here -->
                </div>
            </div>
        </main>
    </div>

    <script src="/static/app.js"></script>
</body>
</html>
  `);
});

// Admin Dashboard
app.get('/admin', authMiddleware, adminMiddleware, (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskBoard Admin - Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div id="adminApp" class="min-h-screen">
        <!-- Admin content will be loaded here -->
    </div>
    <script src="/static/admin.js"></script>
</body>
</html>
  `);
});

export default app;