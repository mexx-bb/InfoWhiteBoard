-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role) VALUES 
  ('admin-user-001', 'admin@taskboard.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin');

-- Insert test users (password for all: test123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role) VALUES 
  ('user-001', 'max.mueller@company.de', '$2a$10$YourHashedPasswordHere', 'Max Müller', 'member'),
  ('user-002', 'anna.schmidt@company.de', '$2a$10$YourHashedPasswordHere', 'Anna Schmidt', 'member'),
  ('user-003', 'thomas.weber@company.de', '$2a$10$YourHashedPasswordHere', 'Thomas Weber', 'observer'),
  ('user-004', 'sarah.klein@company.de', '$2a$10$YourHashedPasswordHere', 'Sarah Klein', 'member'),
  ('user-005', 'michael.braun@company.de', '$2a$10$YourHashedPasswordHere', 'Michael Braun', 'admin');

-- Insert test workspace
INSERT OR IGNORE INTO workspaces (id, name, description, owner_id) VALUES 
  ('workspace-001', 'Hauptarbeitsbereich', 'Unser Team-Workspace für alle Projekte', 'admin-user-001');

-- Add members to workspace
INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role) VALUES 
  ('workspace-001', 'admin-user-001', 'admin'),
  ('workspace-001', 'user-001', 'member'),
  ('workspace-001', 'user-002', 'member'),
  ('workspace-001', 'user-003', 'observer'),
  ('workspace-001', 'user-004', 'member'),
  ('workspace-001', 'user-005', 'admin');

-- Insert test boards
INSERT OR IGNORE INTO boards (id, workspace_id, name, description, created_by) VALUES 
  ('board-001', 'workspace-001', 'Entwicklungs-Sprint', 'Aktueller Sprint für Q1 2025', 'admin-user-001'),
  ('board-002', 'workspace-001', 'Marketing Kampagnen', 'Marketing Aktivitäten und Kampagnen', 'user-002'),
  ('board-003', 'workspace-001', 'Bug Tracking', 'Bug Reports und Fixes', 'user-005');

-- Add board members
INSERT OR IGNORE INTO board_members (board_id, user_id, role) VALUES 
  ('board-001', 'admin-user-001', 'admin'),
  ('board-001', 'user-001', 'member'),
  ('board-001', 'user-002', 'member'),
  ('board-001', 'user-004', 'member');

-- Insert lists for board-001
INSERT OR IGNORE INTO lists (id, board_id, name, position) VALUES 
  ('list-001', 'board-001', 'Backlog', 0),
  ('list-002', 'board-001', 'To Do', 1),
  ('list-003', 'board-001', 'In Progress', 2),
  ('list-004', 'board-001', 'Review', 3),
  ('list-005', 'board-001', 'Done', 4);

-- Insert sample cards
INSERT OR IGNORE INTO cards (id, list_id, title, description, position, created_by) VALUES 
  ('card-001', 'list-001', 'User Authentication implementieren', 'JWT-basierte Authentifizierung mit Refresh Tokens', 0, 'user-001'),
  ('card-002', 'list-001', 'Dashboard UI Design', 'Mockups für das neue Dashboard erstellen', 1, 'user-002'),
  ('card-003', 'list-002', 'API Dokumentation', 'REST API mit Swagger dokumentieren', 0, 'user-001'),
  ('card-004', 'list-003', 'Datenbank Migration', 'PostgreSQL auf neueste Version upgraden', 0, 'user-004'),
  ('card-005', 'list-004', 'Code Review: Feature XYZ', 'Pull Request #142 reviewen', 0, 'user-005'),
  ('card-006', 'list-005', 'Setup CI/CD Pipeline', 'GitHub Actions Workflow einrichten', 0, 'user-001');

-- Insert labels
INSERT OR IGNORE INTO labels (id, board_id, name, color) VALUES 
  ('label-001', 'board-001', 'Urgent', '#ff0000'),
  ('label-002', 'board-001', 'Feature', '#00ff00'),
  ('label-003', 'board-001', 'Bug', '#ff9900'),
  ('label-004', 'board-001', 'Enhancement', '#0099ff'),
  ('label-005', 'board-001', 'Documentation', '#9900ff');

-- Add labels to cards
INSERT OR IGNORE INTO card_labels (card_id, label_id) VALUES 
  ('card-001', 'label-002'),
  ('card-003', 'label-005'),
  ('card-004', 'label-001'),
  ('card-005', 'label-004');

-- Add card members
INSERT OR IGNORE INTO card_members (card_id, user_id) VALUES 
  ('card-001', 'user-001'),
  ('card-002', 'user-002'),
  ('card-003', 'user-001'),
  ('card-004', 'user-004'),
  ('card-005', 'user-005');

-- Add sample checklist
INSERT OR IGNORE INTO checklists (id, card_id, title, position) VALUES 
  ('checklist-001', 'card-001', 'Implementation Tasks', 0);

INSERT OR IGNORE INTO checklist_items (id, checklist_id, content, is_checked, position) VALUES 
  ('check-item-001', 'checklist-001', 'Setup JWT library', true, 0),
  ('check-item-002', 'checklist-001', 'Create auth middleware', true, 1),
  ('check-item-003', 'checklist-001', 'Implement login endpoint', false, 2),
  ('check-item-004', 'checklist-001', 'Add refresh token logic', false, 3),
  ('check-item-005', 'checklist-001', 'Write unit tests', false, 4);

-- Add sample comments
INSERT OR IGNORE INTO comments (id, card_id, user_id, content) VALUES 
  ('comment-001', 'card-001', 'user-002', 'Sieht gut aus! Denk daran, Rate Limiting einzubauen.'),
  ('comment-002', 'card-001', 'user-001', '@user-002 Guter Punkt, werde ich hinzufügen.'),
  ('comment-003', 'card-004', 'user-005', 'Backup nicht vergessen vor der Migration!');

-- Add activity logs
INSERT OR IGNORE INTO activity_logs (workspace_id, board_id, card_id, user_id, action, details) VALUES 
  ('workspace-001', 'board-001', 'card-001', 'user-001', 'card_created', '{"title": "User Authentication implementieren"}'),
  ('workspace-001', 'board-001', 'card-001', 'user-002', 'comment_added', '{"comment": "Sieht gut aus!"}'),
  ('workspace-001', 'board-001', 'card-004', 'user-004', 'card_moved', '{"from": "To Do", "to": "In Progress"}');