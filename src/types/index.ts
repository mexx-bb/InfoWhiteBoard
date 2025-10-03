export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'observer';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  password_hash?: string; // Optional, nur beim Login vorhanden
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  background_color: string;
  is_public: boolean;
  is_archived: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Card {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  is_completed: boolean;
  cover_color?: string;
  is_archived: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: User[];
  labels?: Label[];
  checklists?: Checklist[];
  comments_count?: number;
  attachments_count?: number;
}

export interface Label {
  id: string;
  board_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Checklist {
  id: string;
  card_id: string;
  title: string;
  position: number;
  items?: ChecklistItem[];
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  content: string;
  is_checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  user?: User;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  card_id: string;
  user_id: string;
  user?: User;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  workspace_id?: string;
  board_id?: string;
  card_id?: string;
  user_id: string;
  user?: User;
  action: string;
  details?: any;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  role: string;
  session_id: string;
  exp: number;
  iat: number;
}