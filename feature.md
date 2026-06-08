# Smart Project & Task Collaboration System — Feature Plan

---

## Phase 1 — Project Setup

- [ ] Next.js 14 + TypeScript initialize
- [ ] Tailwind CSS configure
- [ ] Prisma ORM setup
- [ ] Supabase (PostgreSQL) connect
- [ ] Folder structure তৈরি
- [ ] Environment variables (.env) configure
- [ ] ESLint + Prettier setup

---

## Phase 2 — Database Schema (Prisma)

- [ ] User model (id, name, email, password, role, createdAt)
- [ ] Project model (id, name, description, deadline, status, createdBy)
- [ ] Task model (id, title, description, priority, status, dueDate, projectId, assignedTo)
- [ ] TeamMember model (projectId, userId, joinedAt)
- [ ] Comment model (id, taskId, userId, content, createdAt)
- [ ] ActivityLog model (id, action, entityType, entityId, userId, timestamp)
- [ ] Notification model (id, userId, message, read, createdAt)
- [ ] Prisma migrate + seed data

---

## Phase 3 — Authentication

- [ ] Signup page (name, email, password, role)
- [ ] Login page (email, password)
- [ ] Demo Login button (pre-filled credentials)
- [ ] NextAuth.js setup with JWT strategy
- [ ] Password hashing (bcrypt)
- [ ] Role-based middleware
  - Admin → Full access
  - Project Manager → Create/manage projects, assign tasks
  - Team Member → Update assigned tasks only
- [ ] Protected routes (redirect to login if not authenticated)
- [ ] Session handling

---

## Phase 4 — Project Management

- [ ] Project create form (name, description, deadline, status)
- [ ] Project list page (card view + table view)
- [ ] Project detail page
- [ ] Project edit
- [ ] Project delete (with confirmation)
- [ ] Project status update (Active / Completed / On Hold)
- [ ] Project owner / role permission check

---

## Phase 5 — Task Management

- [ ] Task create form (title, description, priority, status, dueDate, assignedTo)
- [ ] Task list by project
- [ ] Task list by status
- [ ] Task edit
- [ ] Task delete
- [ ] Task status change (Todo → In Progress → Completed)
- [ ] Task validation rules:
  - [ ] Duplicate title check (same project এ allow নয়)
  - [ ] Past date as deadline prevent
  - [ ] Completed task reassign prevent
- [ ] Validation error messages:
  - "This task already exists in the project."
  - "Completed tasks cannot be reassigned."
  - "Please select a valid deadline."

---

## Phase 6 — Team Collaboration

- [ ] Project এ member add
- [ ] Project থেকে member remove
- [ ] Task assign to specific member
- [ ] Member-wise task list view
- [ ] Workload summary per member:
  - Total tasks
  - Completed tasks
  - Pending tasks

---

## Phase 7 — Dashboard & Analytics

### KPI Cards
- [ ] Total Projects
- [ ] Total Tasks
- [ ] Completed Tasks
- [ ] Pending Tasks
- [ ] Overdue Tasks

### Charts (Recharts)
- [ ] Tasks by Priority — Pie Chart
- [ ] Project Progress Trend — Bar Chart
- [ ] Task Status Distribution — Donut Chart
- [ ] Team Productivity Overview — Line Chart

### Dashboard Sections
- [ ] Project summary list (name, pending tasks, % completed, deadline)
- [ ] Upcoming deadlines (next 7 days)
- [ ] High priority tasks list
- [ ] Member workload summary table
- [ ] Recent activities (latest 10)

---

## Phase 8 — Activity Log

- [ ] Auto log events:
  - Project created
  - Task created / assigned / status changed
  - Member added to project
  - Comment added
- [ ] Activity log page (full list)
- [ ] Dashboard এ latest 10 activities show
- [ ] Timestamp সহ display (e.g., "10:15 AM — Task 'Setup API' assigned to John")

---

## Phase 9 — Search, Filter & Sort

### Search
- [ ] Project search by name
- [ ] Task search by title or description
- [ ] Member search by name

### Filter Options
- [ ] Filter by project status (Active / Completed / On Hold)
- [ ] Filter by task status (Todo / In Progress / Completed)
- [ ] Filter by priority (High / Medium / Low)
- [ ] Filter by assigned member
- [ ] Filter by deadline status (Upcoming / Overdue)

### Sort Options
- [ ] Sort by latest created
- [ ] Sort by nearest deadline
- [ ] Sort by highest priority
- [ ] Sort by recently updated

### Pagination
- [ ] Project list pagination
- [ ] Task list pagination
- [ ] Activity log pagination

---

## Phase 10 — Additional Features

- [ ] Dark / Light mode toggle (persist preference)
- [ ] File attachment on tasks (Cloudinary)
- [ ] Task comments (add / delete)
- [ ] In-app notification system (mark as read / unread)
- [ ] Quick task status update (inline, without opening form)
- [ ] Bulk task actions — optional (mark multiple as complete)
- [ ] Task progress indicator (visual bar)

---

## Phase 11 — Deployment & Documentation

- [ ] Vercel deployment setup
- [ ] Supabase production DB configure
- [ ] Environment variables set on Vercel
- [ ] README.md লেখা:
  - [ ] Project overview
  - [ ] Features list
  - [ ] Tech stack
  - [ ] Local setup instructions
  - [ ] Environment variables guide
  - [ ] Demo credentials
  - [ ] Live URL
  - [ ] Deployment instructions
- [ ] GitHub repository clean (proper commits, .gitignore)
- [ ] Demo credentials তৈরি (Admin, PM, Member)

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js (JWT) |
| Charts | Recharts |
| File Upload | Cloudinary |
| Deployment | Vercel |

---

## Role Permissions Summary

| Feature | Admin | Project Manager | Team Member |
|---|---|---|---|
| Create Project | ✅ | ✅ | ❌ |
| Edit/Delete Project | ✅ | ✅ (own) | ❌ |
| Create Task | ✅ | ✅ | ❌ |
| Edit/Delete Task | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ (assigned) |
| Add Team Member | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ |
| View Activity Log | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

---

**Total Phases: 11**
**Estimated Features: 80+**
