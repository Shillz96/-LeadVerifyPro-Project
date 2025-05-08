# Quick Setup Guide - LeadVerifyPro Frontend

This guide will help you quickly set up the LeadVerifyPro frontend application for development.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

## Installation Steps

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone https://github.com/yourusername/LeadVerifyPro-Project.git
   cd LeadVerifyPro-Project
   ```

2. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or if you use yarn
   yarn
   ```

4. **Set up environment variables**
   Create a `.env` file in the frontend directory:
   ```bash
   echo "VITE_API_URL=http://localhost:3001" > .env
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or if you use yarn
   yarn dev
   ```

6. **Open the application in your browser**
   The application should now be running at [http://localhost:5173](http://localhost:5173)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Create a production build
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Connecting to the Backend

By default, the frontend expects the backend to be running at `http://localhost:3001`. If your backend is running at a different URL, update the `VITE_API_URL` in your `.env` file.

## Deployment

To deploy the frontend to Vercel:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run the deployment script**
   ```bash
   ./deploy-to-vercel.ps1
   ```

## Troubleshooting

- **Module not found errors**: Make sure all dependencies are installed correctly by running `npm install` again.
- **API connection issues**: Verify that the backend server is running and the `VITE_API_URL` is set correctly.
- **Build errors**: Check the console output for specific error messages and verify that all imports are correct.

If you encounter any other issues, please check the [PROJECT-DOCUMENTATION.md](./PROJECT-DOCUMENTATION.md) file or reach out to the development team.
