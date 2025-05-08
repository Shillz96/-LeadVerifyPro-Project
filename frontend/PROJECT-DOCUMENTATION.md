# LeadVerifyPro Frontend Documentation

## Technology Stack

- **React**: UI library
- **Vite**: Build tool
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Axios**: HTTP client

## Project Structure

```
frontend/
├── public/           # Static files
├── src/              # Source code
│   ├── assets/       # Images, fonts, etc.
│   │   └── images/   # Image files
│   ├── components/   # Reusable UI components
│   │   ├── dashboard/# Dashboard-specific components
│   │   ├── home/     # Home page components
│   │   └── ui/       # Generic UI components
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── layouts/      # Page layout components
│   ├── pages/        # Page components
│   └── utils/        # Utility functions
├── design-documents/ # Design documentation
└── dist/             # Production build (generated)
```

## Component Guidelines

1. **Component Organization**:
   - Place all reusable components in `src/components/`
   - Group components by feature or page when possible
   - Create UI components for shared elements

2. **Naming Conventions**:
   - Use PascalCase for component files (e.g., `Button.jsx`)
   - Use camelCase for utility functions (e.g., `formatDate.js`)
   - Use kebab-case for CSS files (e.g., `button-styles.css`)

3. **Code Style**:
   - Use functional components with hooks
   - Destructure props in component parameters
   - Use prop-types for type checking

## Routing

Routes are defined in `src/App.jsx` using React Router.

```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/leads" element={<Leads />} />
  <Route path="/leads/:id" element={<LeadDetail />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

## State Management

- **Local State**: Use React's `useState` hook for component-level state
- **Context API**: Use for sharing state between components
  - `UserContext`: Manages user authentication state
  - `LeadContext`: Manages lead data

## API Integration

The application uses Axios to communicate with the backend API.

```javascript
// Example API call
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchLeads = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/leads`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};
```

## Styling

The project uses Tailwind CSS for styling.

- Tailwind configuration is in `tailwind.config.js`
- Global styles are in `src/index.css`
- Component-specific styles use Tailwind utility classes directly in JSX

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
```

## Building and Deployment

- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Deployment to Vercel**: `./deploy-to-vercel.ps1`

## Testing

- **Component Testing**: TODO - Add Jest and React Testing Library
- **End-to-End Testing**: TODO - Add Cypress

## Future Improvements

1. Add comprehensive test coverage
2. Implement error boundary components
3. Add internationalization support
4. Improve accessibility compliance
