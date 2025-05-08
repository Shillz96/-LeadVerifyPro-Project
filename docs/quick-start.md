# LeadVerifyPro Quick Start Guide

This guide provides a streamlined workflow for developing and deploying LeadVerifyPro.

## Quick Development Workflow

### 1. Start Local Development Environment

```bash
# Terminal 1 - Start backend (TypeScript, compiles and watches)
cd backend
npm run dev 

# Terminal 2 - Start frontend
cd frontend
npm run dev
```
*Ensure `npm run dev` in the backend correctly starts your TypeScript application in watch mode (e.g., using `nodemon` with `ts-node` or `tsc-watch`).*

### 2. Make Changes and View Them

1.  **Edit code**:
    *   Backend: Modify files in `backend/src`.
    *   Frontend: Modify files in `frontend/src`.
2.  **View changes**:
    *   Frontend: `http://localhost:5173` (auto-refreshes)
    *   Backend API: `http://localhost:5000/api` (or your configured port; dev server should auto-restart)

### 3. Test Your Changes

-   Use browser DevTools (F12) to debug frontend.
-   Check terminal for backend logs/errors.
-   Test API endpoints with the frontend, or tools like Postman/Insomnia.

### 4. Commit and Deploy

```bash
# Stage changes
git add .

# Commit with descriptive message (e.g., feat: add new login feature)
git commit -m "type: Brief description of changes"

# Push to your feature branch, then create a Pull Request to main
# git push origin your-feature-branch

# Once merged to main, deployment to Vercel (frontend) and Render (backend) is typically automatic.
```

## Key URLs

-   **Local Frontend**: `http://localhost:5173`
-   **Local Backend API**: `http://localhost:5000/api` (ensure your backend routes are prefixed with `/api`)
-   **Production Frontend (Vercel)**: `https://leadverifypro.vercel.app` (or your custom domain)
-   **Production Backend API (Render)**: `https://leadverifypro-api.onrender.com/api` (or your specific Render service URL + `/api`)

## Environment Variables

### Frontend (`frontend/.env` or `frontend/.env.development.local`)
```
VITE_API_URL=http://localhost:5000/api 
# Points to your local backend's API.
```

### Backend (`backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb+srv://your_dev_user:your_dev_pass@your_dev_cluster.../your_dev_db # Development DB
JWT_SECRET=your_development_jwt_secret # A simple secret for dev is fine
NODE_ENV=development
# Any other API keys needed for development (e.g., FIRECRAWL_API_KEY)
```

**For Production (Render & Vercel)**: Environment variables (`MONGODB_URI`, `JWT_SECRET` for backend; `VITE_API_URL` for frontend) **must be set directly in the Render and Vercel dashboards**, not in committed `.env` files. The backend has strict checks for these in production.

## Troubleshooting

-   **404 Not Found API errors**: Check that API routes in `backend/src/routes` match frontend requests. Ensure backend API base is `/api` if `VITE_API_URL` includes it.
-   **CORS issues**: Verify CORS settings in `backend/src/server.ts` include `http://localhost:5173` for local dev.
-   **Database connection errors (local dev)**: Check your `MONGODB_URI` in `backend/.env`.
-   **Backend build issues**: Ensure `npm run build` in `backend` directory runs `tsc` and outputs to `dist` without errors.

For more detailed information, see the complete [Development & Deployment Guide](./deployment-guide.md) and [Production Deployment Guide](./production-deployment.md). 