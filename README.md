# LeadVerifyPro Project

This repository contains both the frontend and backend components of the LeadVerifyPro application, a platform for wholesale real estate lead verification.

## Project Structure

```
LeadVerifyPro-Project/
├── frontend/                    # React frontend application
│   ├── public/                  # Static files
│   ├── src/                     # Source code
│   ├── package.json             # Frontend dependencies
│   └── ...                      # Other frontend files
├── backend/                     # Node.js backend API
│   ├── config/                  # Configuration files
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── server.js                # Main entry point
│   └── ...                      # Other backend files
├── docs/                        # Documentation files
│   ├── PRD.markdown             # Product Requirements Document
│   └── ...                      # Other documentation
└── README.md                    # This file
```

## Frontend

The frontend is a React application built with Vite and deployed on Vercel. For more details, see the [frontend documentation](./frontend/PROJECT-DOCUMENTATION.md).

## Backend

The backend is a Node.js API server using Express and MongoDB, deployed on Render. For more details, see the [backend documentation](./backend/backend.md).

## Development Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB

### Setup Instructions

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/LeadVerifyPro-Project.git
   cd LeadVerifyPro-Project
   ```

2. Set up the frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Set up the backend
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

4. Create the admin account
   ```bash
   cd backend
   node scripts/seed-admin.js
   ```
   Follow the prompts to create your superadmin account.

5. Open your browser to http://localhost:5173 to view the frontend

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
./deploy-to-vercel.ps1
```

### Backend (Render)
The backend is configured for automatic deployment on Render.

## Documentation

- [Frontend Documentation](./frontend/PROJECT-DOCUMENTATION.md)
- [Backend Documentation](./backend/backend.md)
- [Quick Setup Guide](./frontend/QUICK-SETUP.md)
- [Product Requirements Document](./docs/PRD.markdown)
- [Admin System Documentation](./docs/admin-system.md)
- [Implementation Plan](./docs/implementation-plan.md)

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Lead Verification**: Verify and validate lead information
- **Dashboard**: Overview of lead verification statistics
- **Subscription Management**: Choose and manage subscription plans
- **Export Functionality**: Export verified leads to CSV format
- **Admin System**: Comprehensive admin dashboard for user management, analytics, and system monitoring
- **Role-Based Access Control**: Three user roles (user, admin, superadmin) with different permissions
- **Team Organizations**: Support for team-based access and collaboration

## Recent Updates (May 2025)

### Database Structure Enhancement
- Added comprehensive verification model for tracking verification status
- Created API integration model for managing third-party service connections
- Implemented transaction and subscription models for improved billing

### API Enhancement
- Added dedicated verification routes for phone and property verification
- Implemented robust rate limiting based on user subscription tier
- Improved error handling and response formatting

### Frontend Improvements
- Added ErrorBoundary component for graceful error handling
- Created reusable LoadingState components with various styling options
- Improved SEO with robots.txt and sitemap.xml

### Performance Optimization
- Implemented API rate limiting to prevent abuse
- Added compression middleware for faster response times
- Created memory-efficient database connection with retry logic

## Admin Features

The LeadVerifyPro includes a robust admin system with:

- User management (create, edit, delete users)
- Subscription management
- System-wide analytics and reporting
- Team and organization management

To access admin features:
1. Create a superadmin account using the seed script
2. Log in with the superadmin credentials
3. Access the admin dashboard through the UI

For more details, see the [Admin System Documentation](./docs/admin-system.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 