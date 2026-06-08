# MolyLearn — Smart Project & Task Collaboration System

A full-stack project and task management web application built with Next.js 16, featuring role-based access control, real-time notifications, analytics dashboards, and team collaboration tools.

---

## Features

### Authentication & Authorization
- Email/password signup and login
- Role-based access control: **Admin**, **Project Manager**, **Team Member**
- JWT session strategy via NextAuth.js v5
- Protected routes with middleware

### Project Management
- Create, edit, and delete projects
- Project statuses: Active / Completed / On Hold
- Deadline tracking with overdue detection
- Task completion progress bar per project
- Add and remove team members per project

### Task Management
- Full CRUD for tasks with title, description, priority, status, due date, and assignee
- Validation rules:
  - Duplicate task title prevention (per project)
  - Past date deadline prevention
  - Completed task reassignment prevention
- Quick inline status update (click circle to advance: Todo → In Progress → Completed)
- Status dropdown for direct selection

### Task Detail & Comments
- Slide-over drawer with full task details
- Visual 3-step progress indicator (Todo → In Progress → Done)
- Add and delete comments on tasks
- Comment count badge on task list rows

### Team Collaboration
- Member workload overview (total / completed / in progress / pending / overdue tasks)
- Role filter for team members
- Expandable project membership list per member

### Dashboard Analytics
- KPI cards: Total Projects, Total Tasks, Completed Tasks, Pending Tasks, Overdue Tasks
- Tasks by Priority — Pie Chart
- Task Status Distribution — Donut Chart
- Project Progress — Bar Chart
- Team Productivity Trend — Line Chart (14-day activity)
- Upcoming deadlines section
- High priority tasks list
- Recent activity feed
- Member workload summary table

### Activity Log
- Auto-logged events: project created/updated, task created/assigned/status changed, member added, comment added
- Full activity timeline grouped by date
- Search, type filter, and date range tabs (All / Today / Week / Month)
- Pagination

### Search, Filter & Sort
- Projects: search by name/description, filter by status, sort by latest/updated/deadline/name
- Tasks: search by title/description, filter by status/priority/project/member/deadline, sort by latest/updated/priority/deadline
- Activity: search + type filter + date range

### Notifications
- In-app notification bell with unread count badge
- Auto-polls every 30 seconds
- Mark single or all notifications as read
- Delete individual notifications
- Notifications triggered on: task assignment, project membership changes

### Appearance & Settings
- Dark / Light / System theme toggle (persisted)
- Profile settings: update display name
- Security settings: change password with current password verification
- Role & Permissions viewer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.7 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma v7 with `@prisma/adapter-pg` |
| Auth | NextAuth.js v5 beta (JWT) |
| Charts | Recharts v3 |
| Forms | React Hook Form + Zod v4 |
| Notifications | Sonner (toast) |
| Icons | Lucide React |
| Theme | next-themes |

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Clone the repository

```bash
git clone <repo-url>
cd molylearn
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:<your-password>@localhost:5432/molylearn"
NEXTAUTH_SECRET="your-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Push schema to database
npm run db:push

# Seed demo data (creates 3 demo users)
npm run seed
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (min 32 chars) |
| `NEXTAUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |

---

## Demo Credentials

Three demo accounts are seeded automatically after running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `demo@1234` |
| Project Manager | `pm@demo.com` | `demo@1234` |
| Team Member | `member@demo.com` | `demo@1234` |

### Role Permissions

| Feature | Admin | Project Manager | Team Member |
|---|---|---|---|
| Create/Edit/Delete Project | ✅ | ✅ | ❌ |
| Create/Edit/Delete Task | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ (assigned only) |
| Add/Remove Team Members | ✅ | ✅ | ❌ |
| View Dashboard & Analytics | ✅ | ✅ | ✅ |
| View Activity Log | ✅ | ✅ | ✅ |
| Add Comments | ✅ | ✅ | ✅ |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login and signup pages
│   ├── (dashboard)/     # Protected app pages
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── team/
│   │   ├── activity/
│   │   └── settings/
│   └── api/             # API routes
│       ├── auth/
│       ├── projects/
│       ├── tasks/
│       ├── team/
│       ├── activity/
│       ├── notifications/
│       └── settings/
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── team/
│   ├── activity/
│   ├── settings/
│   └── shared/
├── lib/
│   ├── db.ts            # Prisma client singleton
│   └── utils.ts         # Helper functions
├── auth.ts              # NextAuth full config (Node.js)
├── auth.config.ts       # NextAuth edge-safe config
└── proxy.ts             # Route protection middleware
prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Demo data seeder
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with demo data |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## Database Schema

- **User** — id, name, email, password, role, createdAt
- **Project** — id, name, description, deadline, status, createdBy
- **Task** — id, title, description, priority, status, dueDate, projectId, assignedTo
- **TeamMember** — projectId, userId, joinedAt
- **Comment** — id, content, taskId, userId, createdAt
- **ActivityLog** — id, action, entityType, entityName, userId, projectId, timestamp
- **Notification** — id, userId, message, read, link, createdAt
