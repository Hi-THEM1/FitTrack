# FitTrack Supabase Database Setup Guide

This guide explains how to set up the Supabase database for the FitTrack application.

## Prerequisites
- A Supabase account (sign up at [supabase.com](https://supabase.com))

## Setup Steps

1. **Create a New Supabase Project:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Fill in project details (name, database password, region)
   - Wait for the project to be created (may take a few minutes)

2. **Get Connection Details:**
   - In your project dashboard, go to Settings > API
   - Copy the "Project URL" and "anon public" key
   - Add them to your `.env.local` file:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Run the Schema:**
   - In your Supabase project, go to SQL Editor
   - Copy and paste the entire content of `schema.sql`
   - Click "Run" to execute the schema creation

4. **Verify Setup:**
   - Go to Table Editor in Supabase dashboard
   - Confirm all tables are created: `user_profiles`, `exercises`, `workout_sessions`, `workout_exercises`, `set_logs`, `food_items`, `meal_entries`

5. **Optional: Seed Data**
   - If you have seed data, run `insert_seed.sql` (update to PostgreSQL syntax if needed)

## Troubleshooting
- If queries fail, check RLS policies in Supabase dashboard under Authentication > Policies
- Ensure your user is authenticated in the app before making queries
- For production, set up proper RLS policies to secure data
