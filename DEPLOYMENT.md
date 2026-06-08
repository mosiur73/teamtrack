# Deployment Guide — MolyLearn

Step-by-step guide to deploy MolyLearn to **Vercel** with **Supabase** as the production PostgreSQL database.

---

## Overview

| Service | Purpose |
|---|---|
| **Vercel** | Host the Next.js application |
| **Supabase** | Managed PostgreSQL database (free tier available) |
| **GitHub** | Source code repository |

---

## Step 1 — Push Code to GitHub

### 1.1 Create a new GitHub repository
1. Go to [github.com](https://github.com) → **New repository**
2. Name it `molylearn` (or any name you prefer)
3. Set to **Private** or **Public**
4. Do **NOT** initialize with README (we already have one)
5. Click **Create repository**

### 1.2 Push your local code

Open terminal in the project folder and run:

```bash
git add .
git commit -m "Initial commit: MolyLearn project"
git branch -M main
git remote add origin https://github.com/<your-username>/molylearn.git
git push -u origin main
```

---

## Step 2 — Set Up Supabase (Production Database)

### 2.1 Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → **Start your project**
2. Sign up / log in with GitHub
3. Click **New Project**
4. Fill in:
   - **Organization:** your org (or create one)
   - **Project name:** `molylearn`
   - **Database Password:** create a strong password (save it!)
   - **Region:** choose the closest to your users
5. Click **Create new project** and wait ~2 minutes

### 2.2 Get the database connection string
1. In your Supabase project, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you set in step 2.1

### 2.3 Run database migration on Supabase

In your local terminal, temporarily set the Supabase URL and push the schema:

```bash
# Set the Supabase DATABASE_URL temporarily
DATABASE_URL="postgresql://postgres:<your-password>@db.xxxx.supabase.co:5432/postgres" npm run db:push
```

Then seed the demo data:

```bash
DATABASE_URL="postgresql://postgres:<your-password>@db.xxxx.supabase.co:5432/postgres" npm run seed
```

---

## Step 3 — Deploy to Vercel

### 3.1 Create a Vercel account
1. Go to [vercel.com](https://vercel.com) → **Sign Up**
2. Sign up with your **GitHub** account

### 3.2 Import the project
1. Click **Add New** → **Project**
2. Find your `molylearn` repository and click **Import**
3. Vercel will auto-detect it as a Next.js project

### 3.3 Configure environment variables

Before clicking **Deploy**, scroll down to **Environment Variables** and add these 3 variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Supabase connection string from Step 2.2 |
| `NEXTAUTH_SECRET` | A random 32+ character string (see below) |
| `NEXTAUTH_URL` | Your Vercel app URL (e.g. `https://molylearn.vercel.app`) |

**Generate NEXTAUTH_SECRET:**

Run this in your terminal to generate a secure random secret:

```bash
openssl rand -base64 32
```

Or use any random string generator (min 32 characters).

> **Note:** You may not know the Vercel URL before deploying. Deploy first with a placeholder, then update `NEXTAUTH_URL` after you see the URL.

### 3.4 Deploy
1. Click **Deploy**
2. Wait 2-3 minutes for the build to complete
3. Vercel will give you a live URL like `https://molylearn.vercel.app`

### 3.5 Update NEXTAUTH_URL
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Find `NEXTAUTH_URL` and update it with your actual Vercel URL
3. Go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

---

## Step 4 — Verify Deployment

1. Visit your live URL (e.g. `https://molylearn.vercel.app`)
2. You should see the login page
3. Log in with demo credentials:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `demo@1234` |
| Project Manager | `pm@demo.com` | `demo@1234` |
| Team Member | `member@demo.com` | `demo@1234` |

4. Test creating a project, task, and comment

---

## Environment Variables Reference

| Variable | Local Value | Production Value |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:12345@localhost:5432/molylearn` | Supabase connection string |
| `NEXTAUTH_SECRET` | any string | secure 32+ char random string |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |

---

## Redeploying After Code Changes

Once connected to GitHub, Vercel **auto-deploys** on every push to `main`:

```bash
git add .
git commit -m "your message"
git push
```

Vercel picks up the changes and deploys automatically within ~2 minutes.

---

## Troubleshooting

### Build fails with Prisma error
Make sure `DATABASE_URL` is set correctly in Vercel environment variables. Supabase connection string must not have spaces.

### Login not working after deploy
Check that `NEXTAUTH_URL` exactly matches your Vercel URL (no trailing slash). Redeploy after updating it.

### Database connection error
In Supabase → **Settings** → **Database** → enable **Connection Pooling** and use the **pooling connection string** instead for better performance on serverless.

### "Unauthorized" errors on API
Make sure `NEXTAUTH_SECRET` is the same value in both local `.env` and Vercel environment variables.
