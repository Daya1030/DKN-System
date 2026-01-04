# DKN Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "admin@dkn.com",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@dkn.com",
    "name": "Admin User",
    "role": "Administrator",
    "country": "North America"
  }
}
```

### Register User (Admin Only)
```
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "newuser@dkn.com",
  "password": "password123",
  "name": "New User",
  "role": "Consultant",
  "country": "Europe"
}

Response:
{
  "message": "User created successfully",
  "user": {
    "id": 5,
    "email": "newuser@dkn.com",
    "name": "New User",
    "role": "Consultant"
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "email": "admin@dkn.com",
  "name": "Admin User",
  "role": "Administrator",
  "country": "North America"
}
```

---

## 👥 User Endpoints

### Get All Users
```
GET /users

Response:
[
  {
    "id": 1,
    "email": "admin@dkn.com",
    "name": "Admin User",
    "role": "Administrator",
    "country": "North America",
    "active": true,
    "created_at": "2024-01-01T10:00:00.000Z"
  },
  ...
]
```

### Get User by ID
```
GET /users/:id

Response:
{
  "id": 1,
  "email": "admin@dkn.com",
  "name": "Admin User",
  "role": "Administrator",
  "country": "North America",
  "active": true
}
```

### Update User
```
PUT /users/:id
Content-Type: application/json

Request:
{
  "name": "Updated Name",
  "role": "KnowledgeChampion",
  "country": "Europe",
  "active": true
}

Response:
{
  "id": 1,
  "email": "admin@dkn.com",
  "name": "Updated Name",
  ...
}
```

### Toggle User Active Status
```
PATCH /users/:id/toggle-active

Response:
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@dkn.com",
  "active": false
}
```

---

## 📄 Document Endpoints

### Get All Documents
```
GET /documents

Response:
[
  {
    "id": 1,
    "title": "Best Practices",
    "description": "Guidelines for development",
    "file_name": "best-practices.pdf",
    "uploaded_by_role": "KnowledgeChampion",
    "uploaded_at": "2024-01-01T10:00:00.000Z",
    "status": "approved",
    "tags": ["development", "guidelines"]
  },
  ...
]
```

### Get Document by ID
```
GET /documents/:id

Response:
{
  "id": 1,
  "title": "Best Practices",
  "description": "Guidelines for development",
  "file_name": "best-practices.pdf",
  "file_content": "<binary data>",
  "uploaded_by_id": 2,
  "status": "approved",
  ...
}
```

### Upload Document
```
POST /documents
Content-Type: application/json

Request:
{
  "title": "New Document",
  "description": "Document description",
  "file_name": "document.pdf",
  "file_content": "data:application/pdf;base64,...",
  "uploaded_by_id": 3,
  "uploaded_by_role": "Consultant",
  "tags": ["tag1", "tag2"]
}

Response:
{
  "message": "Document uploaded successfully",
  "document": {
    "id": 2,
    "title": "New Document",
    "description": "Document description",
    "file_name": "document.pdf",
    "status": "pending"
  }
}
```

### Approve Document
```
PATCH /documents/:id/approve
Content-Type: application/json

Request:
{
  "approved_by_id": 2
}

Response:
{
  "id": 1,
  "title": "Best Practices",
  "status": "approved",
  "approved_by_id": 2,
  ...
}
```

### Reject Document
```
PATCH /documents/:id/reject
Content-Type: application/json

Request:
{
  "rejection_reason": "Needs more details"
}

Response:
{
  "id": 1,
  "title": "Best Practices",
  "status": "rejected",
  "rejection_reason": "Needs more details",
  ...
}
```

---

## 📋 Project Endpoints

### Get All Projects
```
GET /projects

Response:
[
  {
    "id": 1,
    "name": "Mobile App",
    "description": "Mobile app development",
    "plan": "Q1",
    "status": "active",
    "created_at": "2024-01-01T10:00:00.000Z"
  },
  ...
]
```

### Get Project by ID
```
GET /projects/:id

Response:
{
  "id": 1,
  "name": "Mobile App",
  "description": "Mobile app development",
  "plan": "Q1",
  "created_by_id": 2,
  "status": "active",
  ...
}
```

### Create Project
```
POST /projects
Content-Type: application/json

Request:
{
  "name": "New Project",
  "description": "Project description",
  "plan": "Q2",
  "created_by_id": 2
}

Response:
{
  "message": "Project created successfully",
  "project": {
    "id": 2,
    "name": "New Project",
    "description": "Project description",
    "plan": "Q2",
    ...
  }
}
```

### Update Project
```
PUT /projects/:id
Content-Type: application/json

Request:
{
  "name": "Updated Project",
  "description": "Updated description",
  "plan": "Q3",
  "status": "archived"
}

Response:
{
  "id": 1,
  "name": "Updated Project",
  ...
}
```

---

## 👥 Community Endpoints

### Get All Communities
```
GET /communities

Response:
[
  {
    "id": 1,
    "name": "Frontend Developers",
    "description": "Frontend development community",
    "members_count": 15,
    "created_at": "2024-01-01T10:00:00.000Z"
  },
  ...
]
```

### Get Community by ID
```
GET /communities/:id

Response:
{
  "id": 1,
  "name": "Frontend Developers",
  "description": "Frontend development community",
  "created_by_id": 2,
  "members_count": 15,
  ...
}
```

### Create Community
```
POST /communities
Content-Type: application/json

Request:
{
  "name": "Backend Team",
  "description": "Backend development community",
  "created_by_id": 2
}

Response:
{
  "message": "Community created successfully",
  "community": {
    "id": 2,
    "name": "Backend Team",
    ...
  }
}
```

### Join Community
```
POST /communities/:id/join
Content-Type: application/json

Request:
{
  "user_id": 3
}

Response:
{
  "message": "Joined community successfully"
}
```

### Leave Community
```
POST /communities/:id/leave
Content-Type: application/json

Request:
{
  "user_id": 3
}

Response:
{
  "message": "Left community successfully"
}
```

---

## 🔔 Notification Endpoints

### Get User Notifications
```
GET /notifications?user_id=1

Response:
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Document Approved",
    "message": "Your document has been approved",
    "type": "approval",
    "read": false,
    "created_at": "2024-01-01T10:00:00.000Z"
  },
  ...
]
```

### Create Notification
```
POST /notifications
Content-Type: application/json

Request:
{
  "user_id": 1,
  "title": "New Message",
  "message": "You have a new message",
  "type": "message"
}

Response:
{
  "message": "Notification created",
  "notification": {
    "id": 2,
    "user_id": 1,
    ...
  }
}
```

### Mark Notification as Read
```
PATCH /notifications/:id/read

Response:
{
  "id": 1,
  "user_id": 1,
  "title": "Document Approved",
  "read": true,
  ...
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Example: Complete Workflow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dkn.com","password":"admin123"}'

# Get token from response

# 2. Upload Document (with token)
curl -X POST http://localhost:5000/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title":"Guide",
    "description":"New guide",
    "file_name":"guide.pdf",
    "file_content":"data:application/pdf;base64,...",
    "uploaded_by_id":1,
    "uploaded_by_role":"Consultant",
    "tags":["guide"]
  }'

# 3. Approve Document
curl -X PATCH http://localhost:5000/api/documents/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"approved_by_id":2}'
```

---

For more help, check the main README or contact support.
