# LeadVerifyPro Frontend

A modern React-based frontend for the LeadVerifyPro application, built with React, Vite, and TailwindCSS.

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/                # Application source code
│   ├── assets/         # Images, fonts, and other assets
│   │   ├── ui/         # Basic UI elements
│   │   ├── dashboard/  # Dashboard-specific components
│   │   └── home/       # Homepage components
│   ├── contexts/       # React contexts for state management
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page components
│   └── utils/          # Utility functions and API clients
├── design-documents/   # Design documentation and assets
├── .env.example        # Environment variable template
└── vite.config.js      # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd LeadVerifyPro-Project/frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Copy the environment variables template:
   ```
   cp .env.example .env
   ```
5. Update environment variables in `.env` to match your setup

### Development

Start the development server:

```
npm run dev
```

This will start the Vite development server with hot module reloading at http://localhost:3000.

### Building for Production

```
npm run build
```

This will create an optimized production build in the `dist` directory.

### Production Preview

To preview the production build locally:

```
npm run preview
```

## Key Features

- **Performance Optimized**: Built with Vite for fast builds and development
- **Modern UI**: Responsive design built with TailwindCSS
- **Code Splitting**: Lazy loading for optimal performance
- **Authentication**: Complete auth flow with JWT
- **API Integration**: Centralized API client with interceptors

## Code Organization

The application follows a modular organization pattern:

- **Pages**: Full-page components accessed via routes
- **Layouts**: Page structure components (headers, footers, etc.)
- **Components**: Reusable UI components
- **Contexts**: Shared state accessible throughout the app
- **Hooks**: Reusable logic encapsulated in custom hooks
- **Utils**: Helper functions and API clients

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | https://leadverifypro-api.onrender.com/api |
| `VITE_APP_ENV` | Application environment | development |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | false |
| `VITE_ENABLE_DOCUMENT_ANALYSIS` | Enable document analysis | false |

See `.env.example` for all available variables.

## Performance Optimizations

The application includes several performance optimizations:

- **Code Splitting**: Components are lazy-loaded to reduce initial bundle size
- **Image Optimization**: Automatic image optimization via vite-plugin-imagemin
- **Bundle Analysis**: Use `npm run analyze` to visualize bundle size
- **Minification**: JavaScript and CSS minification
- **Compression**: GZIP and Brotli compression

## Deployment

The application is configured for deployment on Vercel. To deploy manually:

```
npm run build
npm run deploy
```

Or use the included script for Vercel deployment:

```
./deploy-to-vercel.ps1
```

## Development Guidelines

When contributing to the frontend, please follow these guidelines:

1. **Component Structure**: Keep components focused and under 200 lines
2. **CSS Approach**: Use TailwindCSS utility classes
3. **State Management**: Use React Context for global state
4. **Performance**: Lazy load non-critical components
5. **Typing**: Add JSDoc comments for better type hints
6. **Error Handling**: Handle API errors gracefully
7. **Testing**: Add tests for critical components
8. **Accessibility**: Ensure components meet WCAG standards

## Additional Resources

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Project Design Documents](./design-documents)

## Project Roadmap

- [x] Initial frontend setup
- [x] Authentication system
- [x] Dashboard page
- [x] Lead verification page
- [x] Subscription and checkout pages
- [ ] Backend API development
- [ ] Integration with email verification services
- [ ] Advanced analytics dashboard
- [ ] User roles and permissions
- [ ] Team collaboration features

## Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- React Icons
- Context API for state management

### Backend (Planned)
- Node.js
- Express
- MongoDB
- JWT Authentication
- Email verification services integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For any inquiries, please reach out to [your-email@example.com](mailto:your-email@example.com).

---

Made with ❤️ by YourCompany
