# 🚀 DevBase — Full-Stack Project Manager (API + Dashboard)

DevBase est une application **full-stack sécurisée** permettant de gérer des **Projects** et des **Tasks** avec :

- 🔐 API REST sécurisée (JWT)
- 🗄️ PostgreSQL via Prisma ORM
- 🧠 Validation stricte avec Zod
- 📄 Documentation OpenAPI (Swagger)
- 🎨 Dashboard React moderne (Mantine)
- 🔗 Intégration backend ↔ frontend réelle (pas de mock)

---

## 🏗 Architecture

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Zod (validation stricte)
- JWT Authentication
- Swagger (OpenAPI)
- Helmet + Rate Limiting

### Frontend

- React (Vite)
- TypeScript
- Mantine UI
- Notifications
- Dark / Light Theme Toggle
- Server-side pagination support

---

# ✨ Fonctionnalités

## 🔐 Auth

- Register / Login avec JWT
- Refresh token (cookie HTTP-only)
- Routes protégées via `Authorization: Bearer <token>`
- Middleware d’authentification
- Logout + nettoyage session

---

## 📁 Projects

- CRUD complet
- Pagination server-side (`page`, `pageSize`)
- Recherche (`search`)
- Tri (`sortBy`, `sortOrder`)
- Ownership strict (un utilisateur ne voit que ses projets)
- Validation Zod en `.strict()`

Réponse pagination :

```json
{
  "items": [...],
  "page": 1,
  "pageSize": 10,
  "total": 4,
  "totalPages": 1
}
```

---

## ✅ Tasks

- CRUD complet
- Filtrage server-side :
  - `projectId`
  - `status`

- Kanban board (TODO / DOING / DONE)
- Vérification ownership
- Vérification que le projet appartient à l’utilisateur
- Validation backend stricte

---

## 📊 Dashboard

- Total Projects
- Total Tasks
- % Done calculé dynamiquement
- Liste des tâches récentes
- Données 100% live (API réelle)

---

## 🎨 Settings

- Light / Dark mode (instantané)
- Persistance via localStorage
- Logout
- Affichage infos API
- Préférences locales (notifications demo)

---

# 🔗 Démo

### API Production

```
https://devbase-api-egxh.onrender.com
```

### Swagger

```
https://devbase-api-egxh.onrender.com/docs
```

> Le frontend consomme l’API via `VITE_API_BASE_URL`.

---

# ✅ Endpoints principaux

## Health

```
GET /health
```

---

## Auth

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

---

## Projects

```
GET    /api/projects?page=1&pageSize=10&search=&sortBy=&sortOrder=
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

---

## Tasks

```
GET    /api/tasks?projectId=&status=
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

---

# ⚙️ Installation (Local)

## Prérequis

- Node.js 18+
- PostgreSQL

---

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Swagger :

```
http://localhost:4000/docs
```

---

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

# 🔐 Variables d’environnement

## Backend `.env`

```
DATABASE_URL=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CORS_ORIGIN=...
PORT=4000
NODE_ENV=production
```

---

## Frontend `.env`

```
VITE_API_BASE_URL=http://localhost:4000
```

ou URL Render en production.

---

# 🧠 Notes techniques importantes

- Pagination Projects = server-side
- Validation stricte Zod (refus des clés inconnues)
- Gestion d’erreurs centralisée :
  - VALIDATION_ERROR
  - UNAUTHORIZED
  - NOT_FOUND
  - INTERNAL_SERVER_ERROR

- API documentée avec OpenAPI 3.0
- Architecture modulaire (`modules/auth`, `modules/projects`, `modules/tasks`)
- Intégration frontend sécurisée (token injecté automatiquement)

---

# 🎯 Ce que ce projet démontre

- Conception d’une API sécurisée
- Gestion de base de données relationnelle
- Validation stricte côté serveur
- Gestion propre des erreurs
- Intégration frontend ↔ backend authentifiée
- Pagination et filtrage server-side
- Dashboard connecté à des données réelles
- Architecture propre et scalable

---

# 👤 Auteur

Fruittella Tshifungat
Full-Stack Developer — Portfolio Project

---
