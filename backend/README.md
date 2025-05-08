# LeadVerifyPro Backend API

This is the backend API service for LeadVerifyPro, built with Node.js, Express, and MongoDB.

## Project Structure

The backend has been migrated from JavaScript to TypeScript. The current structure is:

```
backend/
├── src/                   # TypeScript source code
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models (TypeScript)
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app setup (testing)
│   └── server.ts          # Main server entry point
├── routes/                # Legacy JavaScript routes
├── models/                # Legacy JavaScript models
├── middleware/            # Legacy JavaScript middleware
├── config/                # Legacy JavaScript config
├── utils/                 # Legacy JavaScript utils
├── services/              # Service layer
│   └── firecrawl/         # FireCrawl service
├── dist/                  # Compiled TypeScript output
└── server.js              # Legacy entry point (redirects to TypeScript)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local instance or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd LeadVerifyPro-Project/backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up your environment variables by creating a `.env` file based on the template:
   ```
   cp .env.example .env
   ```
5. Edit the `.env` file with your specific configuration

### Development

For development, run:

```
npm run dev
```

This starts the server in development mode with hot-reloading.

### Building for Production

```
npm run build
```

This compiles TypeScript code into JavaScript in the `dist` directory.

### Running in Production

```
npm run prod
```

This runs the compiled code in production mode.

Alternatively, use PM2 for process management:

```
npm run pm2:start
```

## Environment Variables

Key environment variables:

- `NODE_ENV`: Environment ('development' or 'production')
- `PORT`: Port for the server (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `ENABLE_TEAM_FEATURES`: Enable team features (true/false)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## API Routes

The API follows a RESTful structure:

- `/api/auth` - Authentication and user management
- `/api/leads` - Lead management
- `/api/geospatial` - Geospatial analysis services
- `/api/document-analysis` - Document analysis tools
- `/api/property-analysis` - Property analysis tools
- `/api/admin` - Admin functionality
- `/api/subscriptions` - Subscription management
- `/api/firecrawl` - FireCrawl services

## JavaScript to TypeScript Migration

The codebase is being migrated to TypeScript for better type safety and developer experience. During this transition:

1. New features should be implemented in TypeScript under the `src` directory
2. Legacy JavaScript files are being converted incrementally
3. `server.js` provides backward compatibility with the TypeScript version

## Testing

Run tests with:

```
npm test
```

The project uses Jest for testing.

## Best Practices

- Use TypeScript for all new code
- Follow the established directory structure
- Write tests for all new functionality
- Document code with JSDoc comments
- Follow the error handling pattern in existing code
- Use the logger utility for logging
- Handle async operations with try/catch blocks
- Use environment variables for configuration

## Contributing

1. Make sure to follow the TypeScript migration pattern
2. Create feature branches from `main`
3. Follow code style guidelines
4. Add tests for new functionality
5. Update documentation as needed

## License

Proprietary - All Rights Reserved 