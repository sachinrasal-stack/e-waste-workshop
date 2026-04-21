# E-Waste Awareness Workshop Platform

This repository contains the Next.js frontend application and Serverless API backend for the ProSAR E-waste Awareness Workshop.

## How to Make It Live (For Collaborators)

This application is serverless-ready and instantly compatible with **Vercel**. It uses **Supabase** (PostgreSQL) for its persistent database framework.

### Step 1: Deploy on Vercel
1. Log into [Vercel](https://vercel.com/) (Sign in with your GitHub account).
2. Click **Add New > Project**.
3. Find this GitHub repository in your sync list and hit **Import**.
4. **CRITICAL:** Before pressing the final Deploy button, you must open the **Environment Variables** tab and paste the required Database Keys listed below.

### Step 2: Configure Environment Variables
You must connect a database instance via [Supabase](https://supabase.com/). Once created, inject the generated API keys into the Vercel Dashboard Environment Variables:

```env
# Required for Database Functionality
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional Email Server Setup (Powers the 'Email All' Admin button)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM="E-waste Initiative" <noreply@prosareco.com>
```

### Step 3: Database Schema Blueprint
Run the exact SQL script below inside your Supabase SQL Editor so the Backend algorithms can correctly mount and track users:

```sql
CREATE TABLE settings (
  id integer PRIMARY KEY,
  date text,
  time text,
  link text
);

INSERT INTO settings (id, date, time, link) VALUES 
(1, '16th April', '4:00 PM', 'https://meet.google.com/link');

CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  organization text,
  city text,
  whatsapp text,
  email text UNIQUE,
  created_at timestamp DEFAULT now()
);
```
