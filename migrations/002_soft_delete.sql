-- Add soft delete columns to existing tables
ALTER TABLE boards ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE boards ADD COLUMN deleted_by TEXT DEFAULT NULL;

ALTER TABLE lists ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE lists ADD COLUMN deleted_by TEXT DEFAULT NULL;

ALTER TABLE cards ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE cards ADD COLUMN deleted_by TEXT DEFAULT NULL;

-- Add created_by to track who created items
ALTER TABLE boards ADD COLUMN created_by TEXT DEFAULT NULL;
ALTER TABLE lists ADD COLUMN created_by TEXT DEFAULT NULL;
ALTER TABLE cards ADD COLUMN created_by TEXT DEFAULT NULL;

-- Workspace members table for better role management
CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'member', 'observer')) DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    invited_by TEXT,
    PRIMARY KEY (workspace_id, user_id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Board members for granular permissions
CREATE TABLE IF NOT EXISTS board_members (
    board_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    permissions TEXT DEFAULT 'edit', -- 'view', 'edit', 'admin'
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    added_by TEXT,
    PRIMARY KEY (board_id, user_id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id)
);

-- Audit log for all actions
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Invitation tokens
CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    token TEXT UNIQUE NOT NULL,
    invited_by TEXT NOT NULL,
    accepted BOOLEAN DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Create indexes for soft delete queries
CREATE INDEX idx_boards_deleted ON boards(deleted_at);
CREATE INDEX idx_cards_deleted ON cards(deleted_at);
CREATE INDEX idx_lists_deleted ON lists(deleted_at);
CREATE INDEX idx_workspace_members ON workspace_members(workspace_id, user_id);
CREATE INDEX idx_board_members ON board_members(board_id, user_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at);