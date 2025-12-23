# ProTrack Backend API

Backend API for ProTrack - FYP Management System

## 🚀 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── database/         # Database configuration
│   ├── utils/            # Utility functions
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your database password

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Update the `DATABASE_URL` with your Supabase connection string
3. Update `JWT_SECRET` with a strong random string

```env
DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# OR run migrations (recommended for production)
npm run prisma:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:push` - Push schema changes to database

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Signup

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/all` - Get all users

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### Messages
- `GET /api/messages/groups` - Get chat groups
- `POST /api/messages/groups` - Create chat group
- `GET /api/messages/groups/:groupId/messages` - Get messages
- `POST /api/messages/groups/:groupId/messages` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

## 🔒 Authentication

Most endpoints require authentication. Include JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📚 Next Steps

1. Implement authentication controllers
2. Implement user controllers
3. Implement group controllers
4. Implement task controllers
5. Implement message controllers
6. Implement notification controllers
7. Add file upload functionality
8. Add pagination and filtering

## 🐛 Troubleshooting

### Database connection issues
- Verify your DATABASE_URL in `.env`
- Check if Supabase project is active
- Verify database password is correct

### Prisma Client not generated
- Run `npm run prisma:generate`
- Check if `DATABASE_URL` is set correctly

