# LeadVerifyPro Production Deployment Guide

This document outlines the production deployment setup for LeadVerifyPro and how to work with the application in both online and offline/demo modes.

## Deployment Architecture

LeadVerifyPro uses a modern deployment architecture with separate frontend and backend services:

1. **Frontend**: Deployed on Vercel
   - Production URL: [https://leadverifypro.vercel.app](https://leadverifypro.vercel.app)
   - GitHub integration with automatic deployments from the `main` branch.

2. **Backend**: Deployed on Render
   - Production API URL: [https://leadverifypro-api.onrender.com](https://leadverifypro-api.onrender.com) (or your specific Render service URL)
   - GitHub integration with automatic deployments from the `main` branch.
   - The backend runs the compiled TypeScript application (from the `dist` directory). The main `server.js` file in the root of the backend project now primarily acts as a loader for `dist/server.js`.

## Environment Configuration

### Frontend Environment Variables (Vercel)

The frontend uses the following environment variable, which **must be configured in the Vercel project settings**:

```
VITE_API_URL=https://leadverifypro-api.onrender.com/api 
```
*(Replace with your actual Render backend API URL)*

### Backend Environment Variables (Render)

The backend uses the following environment variables, which **must be configured in the Render service settings**:

```
NODE_ENV=production
PORT=10000 # Render usually sets this automatically, but ensure your app uses the provided PORT.
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/leadverifypro # Your actual MongoDB Atlas connection string.
JWT_SECRET=your_very_strong_and_unique_production_secret_key # A strong, unique JWT secret.
```

**Critical Notes on Backend Environment Variables:**
*   `MONGODB_URI` and `JWT_SECRET` are **mandatory** for the backend to start in a production environment.
*   The application has built-in checks:
    *   It will **fail to start** if `MONGODB_URI` or `JWT_SECRET` are not defined in a `production` environment.
    *   It will also **fail to start** if `JWT_SECRET` is set to the default insecure development key.
*   These variables are **not** to be stored in committed files like `vercel.json` or `.env` files in the repository for production.

## Offline/Demo Mode

To ensure users can still access basic functionality when the backend API is unavailable, the application includes an offline/demo mode:

### Demo Credentials

When the backend is unavailable (or in offline mode due to database connection issues during startup in non-production), users can log in with the following credentials:

- **Email**: demo@example.com
- **Password**: demo123

### Offline Mode Features

- Basic UI navigation
- View demo data (static)
- Limited functionality (no data saving)
- Clear visual indicator showing the app is in demo mode

**Note**: In a production environment, if the backend fails to connect to the database after multiple retries, it logs a critical error. While it might enter an "offline mode" based on current logic, this state is not suitable for a production API, and the logged errors should be investigated immediately.

## Deployment Workflow

1. **Development**: Work locally with both frontend and backend. Ensure `npm run build` for the backend works correctly, compiling TypeScript to the `dist` directory.
2. **Testing**: Test changes in a local or staging environment.
3. **Committing Changes**: Push changes to your feature branch and create a Pull Request to `main`.
4. **Review and Merge**: After review and approval, merge the PR into the `main` branch.
5. **Automatic Deployment**:
   * **Backend (Render)**: Render will automatically detect changes to the `main` branch, build the application (typically `npm install && npm run build`), and start it (e.g., `node dist/server.js` or `npm start` if configured to run the compiled code).
   * **Frontend (Vercel)**: Vercel will automatically detect changes to the `main` branch, build the Vite application, and deploy it.
6. **Verification**: After deployment, thoroughly test the application on the production URLs. Check Render and Vercel logs for any issues.

## Troubleshooting Common Issues

### Backend API Connection Issues

If the backend API is unavailable or returning errors:

1. Check Render dashboard for service status and any ongoing incidents.
2. Verify that the backend service is running and has completed its latest deployment successfully.
3. **Crucially, double-check the environment variables in Render**:
   * Ensure `MONGODB_URI` is correct and the database user has permissions.
   * Ensure `JWT_SECRET` is set and is a strong key.
   * Ensure `NODE_ENV` is `production`.
4. Review backend logs in Render for any startup errors (especially related to missing environment variables or database connection failures) or runtime errors.
5. Restart the backend service via the Render dashboard if necessary.

### Frontend Deployment Issues

If the frontend deployment is having problems:

1. Check Vercel deployment logs for build errors or runtime issues.
2. Verify that `VITE_API_URL` is correctly set in Vercel's environment variables and points to the live Render backend.
3. Ensure build scripts are configured properly in Vercel (usually auto-detected for Vite).

## Monitoring and Maintenance

- Regular monitoring of both frontend (Vercel analytics) and backend services (Render metrics and logs).
- Periodic database backups (MongoDB Atlas usually offers automated backups).
- Performance monitoring through Vercel and Render analytics.
- Regular security updates and dependency maintenance for both frontend and backend.

## Development vs. Production

Key differences between development and production environments:

| Feature             | Development                                     | Production                                                                 |
| ------------------- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| API URL             | `http://localhost:PORT` (e.g., 5000)            | `https://your-app-name.onrender.com/api`                                     |
| Database            | Local or dev MongoDB instance (can use fallback) | Production MongoDB Atlas (strict URI requirement)                          |
| Environment Variables | Loaded from `.env` files, can have fallbacks    | Injected by Render/Vercel; critical vars are mandatory, no insecure defaults |
| Backend Startup     | More lenient with missing env vars              | Strict checks for `MONGO_URI`, `JWT_SECRET`                                |
| Caching             | Minimal or disabled                             | Production-level caching by Vercel/Render, and potentially in-app caching  |
| Logging             | Verbose, debug-level                            | Info/Error-focused, structured logging                                     |

## Future Improvements

Planned improvements to the deployment architecture:

1. Implement CDN for static assets (Vercel handles much of this for the frontend).
2. Add comprehensive logging and monitoring service integration (e.g., Sentry, Datadog).
3. Implement automated end-to-end testing in the CI/CD pipeline.
4. Refine database connection failure strategy for production (e.g., alert and exit vs. offline mode). 