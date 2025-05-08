# LeadVerifyPro Development & Deployment Guide

This guide explains the complete workflow for developing, testing, and deploying changes to the LeadVerifyPro project.

## Project Architecture

- **Frontend**: Vite-based React app hosted on Vercel
- **Backend**: Node.js API (TypeScript, compiled to JavaScript) hosted on Render
- **Database**: MongoDB Atlas cloud database

## Development Workflow

### Step 1: Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shillz96/LeadVerifyPro.git
   cd LeadVerifyPro-Project
   ```

2. **Install dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**:
   - Backend (`backend/.env`):
     ```
     PORT=5000
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname> # Your dev Atlas URI or local MongoDB
     JWT_SECRET=your_development_jwt_secret # Can be the default dev secret
     NODE_ENV=development
     # Add other necessary dev API keys like FIRECRAWL_API_KEY if needed
     ```
   
   - Frontend (`frontend/.env` or `frontend/.env.development.local`):
     ```
     VITE_API_URL=http://localhost:5000/api # Points to local backend /api, ensure your backend exposes routes under /api
     ```

### Step 2: Running the Application Locally

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev # This should run your TypeScript server in watch mode (e.g., using ts-node-dev or nodemon with tsc-watch)
   ```
   The backend will run on `http://localhost:5000` (or as configured).

2. **Start the frontend development server**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or another port if 5173 is busy).

3. **Using Vercel CLI for frontend development** (alternative for emulating Vercel environment):
   ```bash
   cd frontend
   vercel dev
   ```

### Step 3: Making and Testing Changes

1. **Backend changes**:
   - Edit files in the `backend/src` directory (TypeScript files).
   - The server should automatically restart if `npm run dev` uses a watcher.
   - Test API endpoints with tools like Postman, Insomnia, or directly via the frontend.

2. **Frontend changes**:
   - Edit files in the `frontend/src` directory.
   - Changes will automatically refresh in the browser.
   - Use browser dev tools to debug and test your UI.

3. **Testing the full stack**:
   - Ensure both backend and frontend dev servers are running.
   - Use the frontend UI to test interactions with the backend.
   - Check the browser console and backend logs for errors.

### Step 4: Committing Changes

1. **Stage your changes**:
   ```bash
   git add .
   ```

2. **Commit with a descriptive message** (following Conventional Commits is recommended):
   ```bash
   git commit -m "feat: Add user authentication feature" 
   # Examples: fix:, docs:, refactor:, style:, chore:, perf:, test:
   ```

3. **Push to the repository** (typically to a feature branch first, then PR to `main`):
   ```bash
   git push origin your-feature-branch
   ```

## Deployment Process

### Deploying the Backend to Render

1. **Automatic deployment**: Render is typically configured to auto-deploy from the `main` branch.
2. **Build Process on Render**:
   - Render will run the build command specified in its settings. This should be:
     ```
     npm install && npm run build
     ```
     (The `build` script in `backend/package.json` must compile TypeScript from `src` to `dist` using `tsc`).
3. **Start Command on Render**:
   - The start command should execute the compiled JavaScript server. Typically:
     ```
     node dist/server.js 
     # Or 'npm start' if your package.json's start script points to this
     ```
     (The main `backend/server.js` has been updated to primarily load `dist/server.js`.)
4. **Environment Variables on Render**:
   - **Crucial**: Set these in the Render service dashboard (Environment section):
     - `NODE_ENV=production`
     - `MONGODB_URI=your_production_mongodb_atlas_connection_string`
     - `JWT_SECRET=your_strong_unique_production_jwt_secret`
     - `PORT` (Render usually injects this, but ensure your app uses `process.env.PORT`)
     - Any other required API keys for production.
   - The backend will fail to start if `MONGODB_URI` or `JWT_SECRET` are missing or insecure in production.
5. **Checking deployment status**: Monitor Render logs and events.

### Deploying the Frontend to Vercel

1. **Automatic deployment**: Vercel typically auto-deploys from the `main` branch.
2. **Build Process on Vercel**: Vercel usually auto-detects Vite projects and runs `npm run build` (or equivalent).
3. **Environment variables on Vercel**:
   - Set in Vercel Project Settings > Environment Variables:
     - `VITE_API_URL=https://your-render-backend-api-url/api` (e.g., `https://leadverifypro-api.onrender.com/api`)
4. **Preview deployments**: Vercel creates preview deployments for pull requests.
5. **Custom domains**: Configure in Vercel project settings.

## Troubleshooting

### CORS Issues

1. Verify CORS configuration in `backend/src/server.ts` includes the Vercel production and preview URLs, and your local development URL (`http://localhost:5173`).
2. Ensure frontend is sending requests to the correct `VITE_API_URL`.

### API Connection Issues

1. **Frontend**: Double-check `VITE_API_URL` in Vercel.
2. **Backend**: Verify backend is running on Render and accessible. Check Render logs for startup errors (especially related to `MONGODB_URI` or `JWT_SECRET`).

### Deployment Failures

1. **Backend (Render)**:
   - Check build logs for TypeScript compilation (`tsc`) errors.
   - Verify `package.json` scripts (`build`, `start`) are correct.
   - Ensure all production dependencies are listed in `package.json` (not just `devDependencies`).
2. **Frontend (Vercel)**:
   - Review Vercel build logs for Vite errors.
   - Ensure `VITE_API_URL` is correctly set.

## Best Practices

1. **Always test locally before pushing.**
2. **Use feature branches** for changes and create Pull Requests to `main`.
3. **Write meaningful commit messages.**
4. **Keep environment variables secure** and out of the repository (use `.env` locally, platform-set variables for prod).
5. **Monitor deployments** and logs after pushing changes.
6. **Ensure `backend/package.json` correctly defines `main` (e.g., `dist/server.js` or `server.js` if it loads `dist/server.js`) and `scripts` for `build` (compiling TS) and `start` (running compiled JS).** 