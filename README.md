# Accomplishment Tracker

A web application built with Next.js and Supabase that allows users to track their professional accomplishments. Users can sign up, log in, and maintain a record of their achievements with dates and descriptions.

## Features

- User authentication (signup/login) with Supabase
- Create and view accomplishments
- Secure data storage with row-level security
- Responsive design with Tailwind CSS
- Real-time updates

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Supabase (Authentication & Database)
- Tailwind CSS
- Vercel (Deployment)

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses two main tables in Supabase:

### profiles
- id (uuid, primary key)
- created_at (timestamp)
- email (text)
- name (text, nullable)

### accomplishments
- id (uuid, primary key)
- created_at (timestamp)
- title (text)
- description (text)
- date (date)
- user_id (uuid, foreign key to profiles.id)

## Deployment

The application is configured for deployment on Vercel. Simply connect your repository to Vercel and it will automatically deploy your application.

Make sure to add the following environment variables in your Vercel project settings:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Authentication is handled securely by Supabase
- All database queries are protected by RLS policies

## License

MIT
