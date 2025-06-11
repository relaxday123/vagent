# Secure Authentication System with RBAC

A comprehensive authentication system built with Next.js and Supabase, featuring role-based access control, secure session management, and administrative capabilities.

## 🚀 Features

### Authentication
- **Email/Password Registration & Login**: Secure user authentication with Supabase
- **Session Management**: Automatic session handling with secure cookies
- **Email Verification**: Built-in email verification workflow
- **Password Security**: Secure password hashing and validation

### Authorization (RBAC)
- **Role-Based Access Control**: Admin and user roles with granular permissions
- **Route Protection**: Middleware-based route protection
- **Database-Level Security**: Row Level Security (RLS) policies
- **Dynamic Role Assignment**: Admin interface for managing user roles

### Security Features
- **Row Level Security**: Database policies ensuring data isolation
- **CSRF Protection**: Built-in protection against cross-site request forgery
- **Input Validation**: Comprehensive input sanitization and validation
- **Audit Logging**: Complete audit trail of administrative actions
- **Secure Headers**: Security headers for XSS and clickjacking protection

### Admin Dashboard
- **User Management**: View and manage all users and their roles
- **Role Assignment**: Easy role switching for users
- **Audit Logs**: View system activities and administrative actions
- **System Statistics**: Overview of user counts and activities

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 with App Router
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Custom Hooks
- **Type Safety**: TypeScript throughout

### Database Schema
\`\`\`sql
-- Core tables
- auth.users (Supabase managed)
- user_profiles (Extended user information)
- user_roles (Role assignments)
- audit_logs (Activity tracking)

-- Security
- Row Level Security enabled on all tables
- Granular policies for data access
- Audit triggers for sensitive operations
\`\`\`

### Security Policies
1. **User Profiles**: Users can only access their own profile data
2. **User Roles**: Users can view their roles, admins can manage all roles
3. **Audit Logs**: Only admins can view audit logs
4. **Admin Functions**: Protected by role-based middleware

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd secure-auth-system
   npm install
   \`\`\`

2. **Setup Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the SQL scripts in order:
     - `scripts/01-create-auth-tables.sql`
     - `scripts/02-create-functions.sql`
     - `scripts/03-seed-admin-user.sql`

3. **Environment Variables**
   \`\`\`bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   \`\`\`

4. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Creating Your First Admin User

1. Register a new account through the UI
2. In Supabase SQL Editor, run:
   \`\`\`sql
   SELECT promote_first_user_to_admin();
   \`\`\`
3. Or manually insert admin role:
   \`\`\`sql
   INSERT INTO user_roles (user_id, role) 
   VALUES ('your-user-id', 'admin');
   \`\`\`

## 📱 Usage

### User Registration & Login
1. Visit `/auth/register` to create an account
2. Check email for verification link
3. Login at `/auth/login`
4. Access dashboard at `/dashboard`

### Admin Functions
1. Login with admin account
2. Visit `/admin` for admin dashboard
3. Manage user roles in User Management section
4. View system activities in Audit Logs
5. Monitor user statistics and system health

### API Endpoints
- `GET /api/auth/user` - Get current user info
- `POST /api/auth/logout` - Sign out user
- `GET /api/admin/users` - List all users (admin only)
- `PUT /api/admin/users/[id]/role` - Update user role (admin only)

## 🔒 Security Best Practices

### Implemented Security Measures
- **Password Requirements**: Minimum 6 characters with complexity validation
- **Session Security**: Secure HTTP-only cookies with proper expiration
- **CSRF Protection**: Built-in Next.js CSRF protection
- **XSS Prevention**: Input sanitization and CSP headers
- **SQL Injection**: Parameterized queries and Supabase protection
- **Rate Limiting**: Built-in Supabase rate limiting
- **Data Encryption**: All data encrypted at rest and in transit

### Row Level Security Policies
\`\`\`sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all user roles
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
\`\`\`

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with email verification
- [ ] User login/logout functionality
- [ ] Role-based route protection
- [ ] Admin dashboard access control
- [ ] User role management
- [ ] Audit log generation
- [ ] Session persistence across browser refresh
- [ ] Unauthorized access prevention

### Automated Testing
\`\`\`bash
# Run tests (when implemented)
npm run test

# Run E2E tests
npm run test:e2e
\`\`\`

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**
   - Import project to Vercel
   - Connect GitHub repository

2. **Environment Variables**
   - Add all environment variables from `.env.example`
   - Ensure Supabase URLs are production URLs

3. **Deploy**
   \`\`\`bash
   npm run build
   vercel --prod
   \`\`\`

### Production Checklist
- [ ] Environment variables configured
- [ ] Supabase production database setup
- [ ] SSL certificate configured
- [ ] Domain configured
- [ ] Error monitoring setup
- [ ] Backup strategy implemented

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Audit Logs**: Track all administrative actions
- **User Activity**: Monitor login/logout events
- **Error Tracking**: Comprehensive error handling
- **Performance Metrics**: Built-in Next.js analytics

### Recommended Tools
- **Error Tracking**: Sentry integration
- **Analytics**: Vercel Analytics
- **Uptime Monitoring**: Uptime Robot
- **Database Monitoring**: Supabase dashboard

## 🔧 Customization

### Adding New Roles
1. Update the role enum in database:
   \`\`\`sql
   ALTER TABLE user_roles DROP CONSTRAINT user_roles_role_check;
   ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
   CHECK (role IN ('admin', 'user', 'moderator'));
   \`\`\`

2. Update TypeScript types:
   \`\`\`typescript
   export type UserRole = 'admin' | 'user' | 'moderator'
   \`\`\`

3. Add role-specific logic in components

### Custom Authentication Providers
- Google OAuth integration
- GitHub OAuth integration
- Microsoft Azure AD
- Custom SAML providers

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Conventional commit messages
- Component documentation

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

### Common Issues
1. **Email not verified**: Check spam folder, resend verification
2. **Admin access denied**: Ensure admin role is properly assigned
3. **Session expired**: Clear cookies and login again
4. **Database connection**: Check Supabase credentials

### Getting Help
- GitHub Issues for bugs
- Discussions for questions
- Documentation for guides
- Email support for urgent issues

## 🗺️ Roadmap

### Planned Features
- [ ] Multi-factor authentication (MFA)
- [ ] Social login providers
- [ ] Advanced audit filtering
- [ ] User impersonation (admin)
- [ ] Bulk user operations
- [ ] API rate limiting dashboard
- [ ] Advanced role permissions
- [ ] User activity analytics

### Version History
- **v1.0.0**: Initial release with basic RBAC
- **v1.1.0**: Added audit logging
- **v1.2.0**: Enhanced admin dashboard
- **v2.0.0**: Advanced security features (planned)
