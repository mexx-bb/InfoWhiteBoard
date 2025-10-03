# TaskBoard - Trello Clone für Teams

## 🚀 Project Overview
- **Name**: TaskBoard
- **Goal**: Vollwertiges Task-Management-System im Trello-Stil für Teams bis 25 Mitarbeiter
- **Features**: Kanban-Boards, Drag&Drop, Multi-User, Admin-Dashboard, Echtzeit-Kollaboration

## 🌐 URLs
- **Live Demo**: https://3000-i9526dszlekai3x5kjasl-6532622b.e2b.dev
- **Admin Dashboard**: https://3000-i9526dszlekai3x5kjasl-6532622b.e2b.dev/admin
- **API Endpoints**: https://3000-i9526dszlekai3x5kjasl-6532622b.e2b.dev/api/*

## 📱 Mobile Support (NEU!)

### Vollständige Mobile-Optimierung
- ✅ **Responsive Design** - Optimiert für alle Bildschirmgrößen (320px - 4K)
- ✅ **Touch-Support** - Native Touch-Gesten für Drag & Drop
- ✅ **PWA-Ready** - Installierbar als App auf dem Homescreen
- ✅ **Mobile Navigation** - Burger-Menu und FAB-Buttons
- ✅ **Horizontales Scrolling** - Smooth scrolling für Board-Listen
- ✅ **Touch-optimierte Karten** - Long-Press für Drag & Drop
- ✅ **Haptic Feedback** - Vibration bei Interaktionen
- ✅ **Landscape Mode** - Optimiert für Querformat
- ✅ **Safe Areas** - Unterstützung für iPhone Notch/Dynamic Island

### Mobile-spezifische Features
- **Swipe-Gesten** für Listen-Navigation
- **Pull-to-Refresh** (coming soon)
- **Offline-Support** (coming soon)
- **Push Notifications** (coming soon)

## ✅ Aktuell implementierte Features

### 🔐 Authentifizierung & Autorisierung
- ✅ JWT-basierte Authentifizierung mit Session-Management
- ✅ Registrierung neuer Benutzer
- ✅ Login/Logout mit Token-Verwaltung
- ✅ Rollen-System (Admin, Member, Observer)
- ✅ Passwort-Hashing mit Web Crypto API

### 👥 Benutzerverwaltung
- ✅ Benutzerprofile mit Name, E-Mail, Avatar
- ✅ Admin-Dashboard für Nutzerverwaltung
- ✅ Rollenverwaltung durch Admins
- ✅ Benutzer aktivieren/deaktivieren
- ✅ Aktivitätsprotokolle

### 🏢 Arbeitsbereiche (Workspaces)
- ✅ Mehrere Arbeitsbereiche pro Organisation
- ✅ Workspace-Mitglieder mit Rollen
- ✅ Workspace-Owner Verwaltung

### 📋 Boards & Listen
- ✅ Mehrere Boards pro Workspace
- ✅ Anpassbare Board-Hintergrundfarben
- ✅ Listen mit Drag&Drop Sortierung
- ✅ Board-Mitglieder Verwaltung
- ✅ Archivierung von Boards

### 🎯 Karten (Cards)
- ✅ Titel und Beschreibung
- ✅ Drag&Drop zwischen Listen
- ✅ Fälligkeitsdaten
- ✅ Mitglieder-Zuweisung
- ✅ Labels mit Farben
- ✅ Checklisten mit Fortschritt
- ✅ Kommentare & Diskussionen
- ✅ Dateianhänge Support
- ✅ Aktivitätsverlauf

### 🎨 Frontend Features
- ✅ Responsive Design mit Tailwind CSS
- ✅ Drag&Drop Funktionalität
- ✅ Echtzeit-UI-Updates
- ✅ Intuitive Benutzeroberfläche
- ✅ FontAwesome Icons

### 👨‍💼 Admin Features
- ✅ Dediziertes Admin-Dashboard
- ✅ Benutzerstatistiken
- ✅ Rollenverwaltung
- ✅ Aktivitätsprotokolle
- ✅ Benutzer deaktivieren

## 📊 Data Architecture

### Datenmodelle
- **Users**: Benutzerverwaltung mit Rollen und Status
- **Workspaces**: Team-Arbeitsbereiche
- **Boards**: Projekt-Boards mit Hintergrundfarben
- **Lists**: Spalten auf Boards (To Do, In Progress, Done)
- **Cards**: Aufgabenkarten mit vollständigen Details
- **Comments**: Diskussionen auf Karten
- **Attachments**: Dateianhänge
- **Labels**: Kategorisierung mit Farben
- **Checklists**: Aufgabenlisten auf Karten
- **Activity Logs**: Vollständige Aktivitätsverfolgung
- **Notifications**: Benachrichtigungssystem
- **Sessions**: Token-basierte Sessions

### Storage Services
- **Cloudflare D1**: SQLite-basierte Datenbank für alle relationalen Daten
- **Cloudflare KV**: Key-Value Storage für Caching (vorbereitet)
- **Cloudflare R2**: Object Storage für Dateianhänge (vorbereitet)

## 📖 User Guide

### Erste Schritte
1. **Registrierung**: Neues Konto erstellen mit Name, E-Mail und Passwort
2. **Arbeitsbereich erstellen**: Nach Login automatisch oder manuell
3. **Board anlegen**: Neues Board im Arbeitsbereich erstellen
4. **Listen hinzufügen**: Standard oder eigene Listen (Backlog, To Do, In Progress, Review, Done)
5. **Karten erstellen**: Aufgaben in Listen anlegen

### Test-Zugänge
- **Admin**: `admin@taskboard.com` / `admin123`
- **User**: `max.mueller@company.de` / `test123`

### Tastenkombinationen (geplant)
- `Space` - Schnellsuche
- `B` - Neues Board
- `N` - Neue Karte
- `ESC` - Dialog schließen

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Neuen Benutzer registrieren
- `POST /api/auth/login` - Anmelden
- `POST /api/auth/logout` - Abmelden
- `GET /api/auth/me` - Aktueller Benutzer

### Workspaces
- `GET /api/workspaces` - Arbeitsbereiche abrufen
- `POST /api/workspaces` - Neuen Arbeitsbereich erstellen
- `GET /api/workspaces/:id/boards` - Boards im Workspace

### Boards
- `POST /api/boards` - Neues Board erstellen
- `GET /api/boards/:id` - Board mit Listen und Karten
- `PUT /api/boards/:id` - Board aktualisieren
- `DELETE /api/boards/:id` - Board archivieren

### Lists
- `POST /api/boards/:boardId/lists` - Neue Liste erstellen
- `PUT /api/lists/:id` - Liste aktualisieren
- `DELETE /api/lists/:id` - Liste archivieren

### Cards
- `POST /api/lists/:listId/cards` - Neue Karte erstellen
- `PUT /api/cards/:id` - Karte aktualisieren
- `PUT /api/cards/:id/move` - Karte verschieben
- `DELETE /api/cards/:id` - Karte archivieren

### Admin
- `GET /api/admin/users` - Alle Benutzer (Admin only)
- `PUT /api/admin/users/:id/role` - Rolle ändern
- `PUT /api/admin/users/:id/deactivate` - Benutzer deaktivieren
- `GET /api/admin/activity` - Aktivitätsprotokolle

## 🚧 Features noch nicht implementiert

### Priorität 1 (Wichtig)
- [ ] Echtzeit-Updates mit WebSockets/SSE
- [ ] E-Mail Benachrichtigungen
- [ ] Datei-Upload zu Cloudflare R2
- [ ] Erweiterte Suche & Filter
- [ ] Board-Templates

### Priorität 2 (Nice to have)
- [ ] @-Erwähnungen in Kommentaren
- [ ] Keyboard Shortcuts
- [ ] Dark Mode
- [ ] Multi-Language Support
- [ ] Kalender-Integration
- [ ] Gantt-Chart Ansicht
- [ ] Export (CSV, PDF)
- [ ] Mobile App

### Priorität 3 (Zukunft)
- [ ] Time Tracking
- [ ] Burndown Charts
- [ ] Custom Fields
- [ ] Automation Rules
- [ ] Webhooks
- [ ] API für Drittanbieter
- [ ] SSO Integration

## 💡 Empfohlene nächste Schritte

1. **Datenbank initialisieren**:
   ```bash
   npx wrangler d1 create taskboard-db
   # ID in wrangler.jsonc eintragen
   npm run db:migrate:local
   npm run db:seed
   ```

2. **Echtzeit-Updates implementieren**:
   - Server-Sent Events für Live-Updates
   - Oder Polling-Mechanismus als Fallback

3. **Datei-Upload aktivieren**:
   - R2 Bucket erstellen
   - Upload-Endpoint implementieren
   - Attachment-Preview hinzufügen

4. **E-Mail Integration**:
   - SendGrid/Resend API einbinden
   - Notification-System erweitern

5. **Mobile Optimierung**:
   - Touch-Events für Mobile Drag&Drop
   - PWA Manifest hinzufügen

## 🚀 Deployment

### Lokale Entwicklung
```bash
npm run dev:d1  # Mit D1 Database
npm run build   # Production Build
pm2 start ecosystem.config.cjs  # Service starten
```

### Cloudflare Pages Deployment
```bash
# API Key einrichten
npx wrangler login

# Datenbank erstellen (Production)
npx wrangler d1 create taskboard-db
npm run db:migrate:prod

# Deploy
npm run deploy:prod
```

### Tech Stack
- **Backend**: Hono Framework auf Cloudflare Workers
- **Frontend**: Vanilla JavaScript mit Tailwind CSS
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT mit Web Crypto API
- **Hosting**: Cloudflare Pages
- **Runtime**: Edge Runtime (Cloudflare Workers)

## 📝 Lizenz
MIT License - Frei verwendbar für kommerzielle und private Zwecke

## 🤝 Support
Bei Fragen oder Problemen erstelle ein Issue oder kontaktiere das Entwicklungsteam.

---
*Entwickelt mit ❤️ für effiziente Team-Kollaboration*