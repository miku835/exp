# Experience Hub

A full-stack ChatGPT-style code library for computer science experiment snippets. Built with a React/Vite frontend and an Express backend, using a pnpm monorepo structure.

## Features
- **Dark Mode UI**: Modern, responsive design for code browsing.
- **Dynamic Content**: Experiments are loaded from JSON files.
- **API Integrated**: Express server serves experiment data and static assets.
- **Vercel Ready**: Pre-configured for seamless deployment to Vercel.

## Project Structure
- `artifacts/experiment-library`: Vite + React Frontend.
- `artifacts/api-server`: Express Backend.
- `lib/`: Shared workspace packages (API client, database schemas, etc.).
- `api/`: Vercel serverless function entry point.

## Local Development

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Run API Server**:
   ```bash
   cd Experience-Hub/artifacts/api-server
   pnpm run dev
   ```

3. **Run Frontend**:
   ```bash
   cd Experience-Hub/artifacts/experiment-library
   pnpm run dev
   ```

## Deployment on Vercel

1. **Import the repository** in Vercel.
2. **Environment Variables**: Add `DATABASE_URL` (PostgreSQL) in Vercel Settings.
3. **Deploy**: Vercel will use the included `vercel.json` to configure the routes and build the project.

## Database
The project uses PostgreSQL with Drizzle ORM. Ensure your `DATABASE_URL` is configured correctly in your environment.
