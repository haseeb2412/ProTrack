# ProTrack

ProTrack is a full-stack final year project (FYP) management system designed to help students, teachers, and administrators manage project groups, tasks, feedback, and communication in one place.

The project is divided into two main parts:

- Frontend: React + Vite + TypeScript admin/student/teacher dashboard UI
- Backend: Node.js + Express + TypeScript API with Prisma and PostgreSQL support

## Why we built this project

We created ProTrack to solve common problems in final-year project coordination:

- students often lose track of project tasks and feedback
- teachers need a structured way to review submissions and give comments
- groups need better visibility for project assignments and progress
- administrators need a simple control panel to manage teachers, projects, and groups

The goal is to make FYP management more organized, transparent, and easier to monitor from one platform.

## Project status

This project is currently in a strong prototype / MVP foundation stage.

We have implemented the core structure, dashboard layouts, API foundation, and role-based application flow. However, some features are still demo/mock based and not yet fully connected to live database-backed functionality.

## Tech stack and why we used it

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (UI component library)

Why:
- React gives us reusable and maintainable UI components
- TypeScript helps reduce runtime issues and keeps the app more stable
- Vite makes frontend development faster and lighter
- Tailwind allows quick and modern UI styling
- shadcn/ui gives professional and consistent component design

### Backend
- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (Supabase-ready)
- JWT authentication
- Zod validation

Why:
- Node.js is fast and suitable for APIs
- TypeScript improves code quality and maintainability
- Express provides a lightweight backend structure
- Prisma simplifies database modeling and queries
- PostgreSQL is reliable and scalable for production use
- JWT is standard for secure role-based authentication
- Zod keeps request validation clean and predictable

## What we implemented

### Frontend features
- Role-based dashboard routing for:
  - Super Admin
  - Teacher
  - Student
- Login and signup pages
- Protected routes based on user role
- Student dashboard with task management view
- Teacher dashboard for reviewing and approving tasks
- Super admin dashboard for managing teachers and groups
- Group creation UI with project/teacher/student selection
- Task status display (pending, approved, needs revision)
- Student task creation interface
- Account settings page structure
- Chat widget and notification UI structure
- Responsive layout and modern dashboard design

### Backend features
- Express server setup
- CORS and health check endpoint
- JWT-based authentication routes
- User signup and login endpoints
- Prisma schema for users, students, teachers, groups, projects, tasks, chat, and notifications
- User profile retrieval and update endpoints
- Role-based user model structure
- Database support for final-year project entities
- Validation layer using Zod
- Middleware for errors and not-found handling

### Data model foundation
- User roles: SUPER_ADMIN, TEACHER, STUDENT
- Teacher profile
- Student profile with enrollment ID and group assignment
- Project model
- Group model
- Task model with status tracking
- Task comments and feedback
- Chat group and messaging schema
- Notification model

## What we have not implemented yet

The following items are still pending or not fully completed in this version:

- full production database seeding and data migration
- real-time chat messaging backend
- fully working live notification system
- complete integration between frontend dashboard and live backend APIs
- actual file upload storage (currently scaffolded)
- real assignment of tasks/groups across the full app lifecycle
- advanced reporting and evaluation analytics
- complete admin approval workflow for all entities
- production deployment setup and CI/CD pipeline
- testing suite (unit/integration/e2e)
- complete user profile image upload integration
- final security hardening for production

## Important note about current implementation

The frontend currently uses demo/mock data for many dashboard flows, while the backend provides a solid foundation for real data operations. In other words:

- the UI screens are largely designed and implemented
- the backend architecture is established and partly functional
- the app is not yet fully end-to-end live with complete real data logic

## Project structure

```text
ProTrack/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── README.md
└── .git/
```

## Quick start

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Run frontend

```bash
cd frontend
npm run dev
```

### 4. Run backend

```bash
cd backend
npm run dev
```

### 5. Setup environment

Create a `.env` file in the backend with your PostgreSQL database URL and JWT secret, for example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/protrack"
JWT_SECRET="your-secret-key"
PORT=5000
```

## Future goals

The next roadmap for this project is to turn the prototype into a fully operational FYP management platform by:

- connecting all frontend screens to live backend APIs
- finalizing group/task workflows
- building real-time messaging and notifications
- adding admin analytics and review modules
- improving authentication and security
- adding automated tests and deployment support

## Summary

ProTrack is a practical academic project management platform aiming to simplify how final-year projects are assigned, reviewed, tracked, and communicated. The current codebase has a strong foundation in both frontend design and backend architecture, but it still needs more real backend integration and production-ready completion before it can be considered a fully finished system.

## License

This project is currently for academic / development use and may be updated according to project requirements.
