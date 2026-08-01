# নতুন Laptop এ TeamTrack চালানোর Guide

---

## Step 1 — প্রয়োজনীয় Software Install করো

নিচের software গুলো নতুন laptop এ install করতে হবে:

### 1.1 Node.js
- Download: https://nodejs.org
- Version: 18 বা তার উপরে
- Install করার পর terminal এ check করো:
  ```bash
  node -v
  npm -v
  ```

### 1.2 PostgreSQL
- Download: https://www.postgresql.org/download
- Install করার সময় একটা password দাও (মনে রাখো, পরে লাগবে)
- Default port: 5432 (পরিবর্তন করো না)

---

## Step 2 — Project Setup করো

### 2.1 ZIP extract করো
Google Drive থেকে `TeamTrack.zip` download করে extract করো।

### 2.2 Database তৈরি করো
PostgreSQL এ `TeamTrack` নামে একটা database তৈরি করতে হবে।

**pgAdmin দিয়ে (GUI):**
1. pgAdmin খোলো
2. বাম দিকে `Databases` এ right-click করো
3. `Create → Database` এ click করো
4. Name দাও: `TeamTrack`
5. Save করো

**অথবা terminal দিয়ে:**
```bash
psql -U postgres
CREATE DATABASE TeamTrack;
\q
```

---

## Step 3 — Environment Variables (.env) তৈরি করো

Project folder এর ভেতরে `.env` নামে একটা file তৈরি করো এবং নিচের content লিখো:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/TeamTrack"
NEXTAUTH_SECRET="supersecretkey123456789TeamTrack2025"
NEXTAUTH_URL="http://localhost:3000"
```

> **`YOUR_PASSWORD`** এর জায়গায় PostgreSQL install করার সময় যে password দিয়েছিলে সেটা দাও।

---

## Step 4 — Project চালাও

Terminal খোলো, project folder এ যাও এবং একটার পর একটা command চালাও:

```bash
# 1. সব dependency install করো
npm install

# 2. Database এ schema তৈরি করো
npm run db:push

# 3. Demo data (Admin, PM, Member) তৈরি করো
npm run seed

# 4. Project চালাও
npm run dev
```

Browser এ যাও: **http://localhost:3000**

---

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | demo@1234 |
| Project Manager | pm@demo.com | demo@1234 |
| Team Member | member@demo.com | demo@1234 |

---

## সমস্যা হলে

### "Cannot connect to database" error
- PostgreSQL চালু আছে কিনা দেখো
- `.env` এ password ঠিক আছে কিনা দেখো
- `TeamTrack` database তৈরি হয়েছে কিনা দেখো

### "Port 3000 already in use" error
অন্য port এ চালাও:
```bash
npm run dev -- -p 3002
```
তাহলে `.env` এ `NEXTAUTH_URL="http://localhost:3002"` করতে হবে।

### "npm not found" error
Node.js ঠিকমতো install হয়নি — আবার install করো।

### `npm run seed` error
```bash
npm install -g tsx
npm run seed
```

---

## সব ঠিক থাকলে যা দেখবে

```
✓ Ready on http://localhost:3000
```

এরপর browser এ **http://localhost:3000** গেলে Landing page দেখাবে।
