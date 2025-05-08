# LeadVerifyPro Admin System

This document provides an overview of the Admin System for LeadVerifyPro, including how to set up admin accounts, the available admin features, and best practices.

## Admin Roles

The system supports three roles:

1. **User** - Regular users with limited permissions
2. **Admin** - Administrators who can manage users and view system stats
3. **Superadmin** - Super administrators with full access to all system features

## Setting Up Admin Accounts

### Creating the First Superadmin

To create the initial superadmin account, run the seed script:

```bash
cd backend
node scripts/seed-admin.js
```

Follow the prompts to set up your superadmin account. This account will have unlimited access to all features of the system.

### Creating Additional Admin Users

Once you have a superadmin account, you can create additional admin users through the admin dashboard:

1. Log in with your superadmin account
2. Navigate to the Admin Dashboard
3. Go to the Users section
4. Click "Add New User"
5. Fill in the user details and select the role "Admin"
6. Click "Create User"

**Note**: Only superadmins can create other admin accounts.

## Admin Features

### User Management

Admins can:

- View all users in the system
- Create new user accounts
- Edit user details
- Change user subscription plans
- Reset user passwords
- Lock/unlock user accounts

### Dashboard Analytics

The admin dashboard provides insights into:

- Total users and active users
- User growth over time
- Subscription plan breakdown
- Lead activity stats
- System performance metrics

### Organization Management

Admins can manage teams and organizations:

- View all organizations
- See organization members
- Manage organization subscriptions
- Monitor organization activity

## API Endpoints

All admin functionality is accessed through the `/api/admin` endpoints:

- `GET /api/admin/dashboard` - Get admin dashboard statistics
- `GET /api/admin/users` - List all users with pagination
- `GET /api/admin/users/:userId` - Get specific user details
- `POST /api/admin/users` - Create a new user
- `PUT /api/admin/users/:userId` - Update user details
- `DELETE /api/admin/users/:userId` - Delete a user (superadmin only)
- `POST /api/admin/users/:userId/reset-password` - Reset a user's password
- `PUT /api/admin/users/:userId/status` - Change user account status
- `GET /api/admin/organizations` - List all organizations

## Security Considerations

1. **Role-Based Access Control**: Different permissions are enforced based on user roles.
2. **Important Safeguards**:
   - The system prevents deletion of the last superadmin account
   - Only superadmins can manage other admin accounts
   - Account locking happens after 5 failed login attempts
   - All admin actions are logged in the system

3. **Best Practices**:
   - Always use strong passwords for admin accounts
   - Regularly review the admin activity logs
   - Create separate admin accounts for each administrator (no shared accounts)
   - Reset admin passwords periodically

## User Data Structure

The User model includes the following key fields:

```javascript
{
  email: String,
  password: String, // Hashed
  firstName: String,
  lastName: String,
  company: String,
  role: String, // 'user', 'admin', or 'superadmin'
  subscription: {
    plan: String, // 'free', 'basic', 'premium', 'enterprise'
    status: String, // 'active', 'inactive', 'trial', 'expired'
    limits: {
      leadsPerMonth: Number,
      apiCallsPerDay: Number,
      batchSize: Number,
      advancedFeatures: Boolean
    }
  },
  usageStats: {
    leadsUploaded: Number,
    leadsVerified: Number,
    apiCalls: Number,
    loginHistory: [{ date, ipAddress, userAgent }]
  },
  preferences: {
    notifications: { email, sms, marketingEmails },
    dashboard: { defaultView, theme }
  },
  team: {
    organization: ObjectId,
    isTeamAdmin: Boolean,
    permissions: [String]
  },
  accountLocked: Boolean,
  failedLoginAttempts: Number
}
```

## Organization Data Structure

Organizations enable team-based collaboration:

```javascript
{
  name: String,
  description: String,
  subscription: {
    plan: String, // 'team', 'business', 'enterprise'
    status: String,
    seats: { total, used }
  },
  owner: ObjectId, // Reference to a User
  members: [{
    user: ObjectId,
    role: String, // 'owner', 'admin', 'member', 'viewer'
    permissions: [String]
  }]
}
```

## Troubleshooting

### Common Issues

1. **Unable to create admin account**: Ensure you're logged in as a superadmin.
2. **Account locked**: Use the seed script to reset the password for the superadmin.
3. **Permissions issues**: Double-check the user's role in the database.

For any other issues, check the server logs for error messages. 