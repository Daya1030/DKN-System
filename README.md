# DKN Backend API

Node.js/Express backend for the DKN Knowledge & Governance Platform with PostgreSQL database integration.

## Prerequisites

- Node.js v14+
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Install PostgreSQL

Download from: https://www.postgresql.org/download/

### 2. Create Database

```sql
-- Open PostgreSQL command line
psql -U postgres

-- Create database
CREATE DATABASE velion_dkn;
```

### 3. Install Dependencies

```bash
cd DKN-Backend
npm install
```

### 4. Configure Environment Variables

Edit `.env` file with your PostgreSQL credentials:

```
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=velion_dkn
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_this

# CORS Settings
FRONTEND_URL=http://localhost:5173
```

### 5. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user (requires token)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/toggle-active` - Toggle user active status

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Upload document
- `PATCH /api/documents/:id/approve` - Approve document
- `PATCH /api/documents/:id/reject` - Reject document

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project

### Communities
- `GET /api/communities` - Get all communities
- `GET /api/communities/:id` - Get community by ID
- `POST /api/communities` - Create community
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read

## Database Schema

### Tables
- `users` - User accounts with roles
- `documents` - Uploaded documents with approval workflow
- `projects` - Projects with plans
- `communities` - Communities/Groups
- `community_members` - Community membership tracking
- `notifications` - User notifications

## Test Credentials (Default)

For testing with pre-populated data:

```
Admin: admin@dkn.com / admin123
Knowledge Champion: champion@dkn.com / champion123
Consultant: consultant@dkn.com / consultant123
New Hire: newhire@dkn.com / newhire123
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
- Verify database `velion_dkn` exists

### Port Already in Use
- Change PORT in .env or use: `PORT=5001 npm run dev`

### CORS Errors
- Update FRONTEND_URL in .env to match your frontend URL

## Next Steps

1. Run `npm install` to install dependencies
2. Update `.env` with your PostgreSQL credentials
3. Run `npm run dev` to start the server
4. Tables will be created automatically on first run
5. Update the frontend API calls to use these endpoints

## Support

For issues or questions, check the main DKN-Frontend README.
