# ProTrack API Guide

## How a request moves through the backend

1. `src/index.ts` loads environment variables, configures Express, CORS, and JSON parsing, then mounts the route files under `/api`.
2. A file in `src/routes/` matches the HTTP method and URL. Protected route files run `authenticate` from `src/middleware/auth.middleware.ts` first; it validates the bearer token and attaches the user identity and role to the request.
3. The route calls its controller in `src/controllers/`. Controllers validate request bodies, check access rules, and run database queries through the shared Prisma client in `src/database/prisma.ts`.
4. `prisma/schema.prisma` defines the PostgreSQL tables, relationships, and enums used by those queries.
5. Successful requests return JSON. Errors pass through `src/middleware/errorHandler.ts`; unmatched URLs pass through `src/middleware/notFoundHandler.ts`.

### File responsibilities

| File/folder | Responsibility |
|---|---|
| `src/index.ts` | Loads configuration and mounts the API routes. |
| `src/routes/*.routes.ts` | Maps HTTP methods and paths to middleware and controller functions. |
| `src/controllers/auth.controller.ts` | Signup and login. |
| `src/controllers/user.controller.ts` | Profile, avatar, and admin user list. |
| `src/controllers/group.controller.ts` | Project group CRUD and group access filtering. |
| `src/controllers/task.controller.ts` | Student task submissions, teacher review, and comments. |
| `src/controllers/message.controller.ts` | Chat groups and messages. |
| `src/controllers/notification.controller.ts` | User notifications and read status. |
| `src/middleware/auth.middleware.ts` | JWT authentication and role authorization helpers. |
| `src/middleware/errorHandler.ts` | Validation, Prisma, upload, and application error responses. |
| `src/config/multer.ts` | In-memory avatar uploads; images up to 5 MB. |
| `src/utils/validation.ts` | Signup and login input schemas. |
| `src/database/prisma.ts` | Shared Prisma client instance. |
| `prisma/schema.prisma` | Database models, relations, and enums. |

## Start the API

From the `backend` folder, install dependencies, configure `.env` with `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET`, generate Prisma Client, apply the schema, and start the development server. Set `SUPER_ADMIN_SIGNUP_KEY` to a separate private value if you need to create a super-admin account through signup.

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API base URL is `http://localhost:5000`. Use `npm run prisma:push` instead of `npm run prisma:migrate` only when you intentionally do not need migration history. See `README.md` for Supabase setup details.

## Testing notes

- These examples use `curl.exe`, which is available in current Windows versions. In Thunder Client, use the same method, URL, headers, and JSON body shown for each request.
- For JSON requests, set `Content-Type` to `application/json`.
- Replace `YOUR_TOKEN` with the `data.token` returned by login. Protected requests need `Authorization: Bearer YOUR_TOKEN`.
- Replace `GROUP_ID`, `TASK_ID`, `CHAT_GROUP_ID`, and `NOTIFICATION_ID` with IDs returned by earlier requests.
- Signup roles in the request are lowercase: `student`, `teacher`, or `super_admin`. Signup creates role-specific teacher/student profiles automatically. Super-admin signup also requires `signupKey` to match the private `SUPER_ADMIN_SIGNUP_KEY` environment variable.
- Group `teacherId` and `studentIds` are **User IDs** returned by signup or login, not profile IDs.
- Group creation creates a new project from the nested `project` object and assigns the selected students. A student can belong to one group at a time; a group can contain up to four students.
- Deleting a group cascades to its tasks; keep the delete request for last when testing.
- Students create task submissions for their own assigned group. Teachers can change task status and add comments only for their assigned groups.
- `fileUrl` and `fileName` on tasks are optional text fields; task-file storage is not implemented. Avatar upload is supported as a multipart image.
- Group create/update/delete are super-admin only. Group and task reads are filtered by the authenticated user's role.

## cURL requests

### Health

```powershell
curl.exe -i "http://localhost:5000/health"
```

### Authentication

Create users with the needed roles. Run the signup request once per account, changing the role and email as needed.

```powershell
curl.exe -X POST "http://localhost:5000/api/auth/signup" -H "Content-Type: application/json" -d '{"name":"Admin User","email":"admin@example.com","password":"ChangeMe123!","role":"super_admin","signupKey":"YOUR_SUPER_ADMIN_SIGNUP_KEY"}'
curl.exe -X POST "http://localhost:5000/api/auth/signup" -H "Content-Type: application/json" -d '{"name":"Teacher One","email":"teacher@example.com","password":"ChangeMe123!","role":"teacher"}'
curl.exe -X POST "http://localhost:5000/api/auth/signup" -H "Content-Type: application/json" -d '{"name":"Student One","email":"student@example.com","password":"ChangeMe123!","role":"student"}'
```

```powershell
curl.exe -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"ChangeMe123!","role":"super_admin"}'
curl.exe -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"teacher@example.com","password":"ChangeMe123!","role":"teacher"}'
curl.exe -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"student@example.com","password":"ChangeMe123!","role":"student"}'
```

### Users

```powershell
curl.exe "http://localhost:5000/api/users/profile" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X PUT "http://localhost:5000/api/users/profile" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"Teacher One Updated","designation":"Professor"}'
curl.exe "http://localhost:5000/api/users/all" -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
curl.exe -X POST "http://localhost:5000/api/users/avatar" -H "Authorization: Bearer YOUR_TOKEN" -F "avatar=@C:\path\to\avatar.png"
curl.exe "http://localhost:5000/api/users/directory" -H "Authorization: Bearer YOUR_TOKEN"
```

`/api/users/directory` returns the minimal user list (ID, name, role, and avatar) for authenticated chat member selection. `/api/users/all` remains super-admin only and returns role profile details.

### Groups

Create a group as a super admin. The teacher and student IDs below must be existing User IDs.

```powershell
curl.exe -X POST "http://localhost:5000/api/groups" -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"Team Alpha","project":{"name":"ProTrack Demo","description":"A project used to test group APIs"},"teacherId":"TEACHER_USER_ID","studentIds":["STUDENT_USER_ID"]}'
```

```powershell
curl.exe "http://localhost:5000/api/groups" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe "http://localhost:5000/api/groups/GROUP_ID" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X PUT "http://localhost:5000/api/groups/GROUP_ID" -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"Team Alpha Updated","studentIds":["STUDENT_USER_ID"]}'
curl.exe -X DELETE "http://localhost:5000/api/groups/GROUP_ID" -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

### Tasks

```powershell
curl.exe "http://localhost:5000/api/tasks" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X POST "http://localhost:5000/api/tasks" -H "Authorization: Bearer YOUR_STUDENT_TOKEN" -H "Content-Type: application/json" -d '{"name":"Project proposal","description":"Submit the project proposal document.","fileName":"proposal.pdf"}'
curl.exe "http://localhost:5000/api/tasks/TASK_ID" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X PUT "http://localhost:5000/api/tasks/TASK_ID" -H "Authorization: Bearer YOUR_STUDENT_TOKEN" -H "Content-Type: application/json" -d '{"description":"Updated submission details","fileUrl":"https://example.com/proposal.pdf","fileName":"proposal.pdf"}'
curl.exe -X PUT "http://localhost:5000/api/tasks/TASK_ID" -H "Authorization: Bearer YOUR_TEACHER_TOKEN" -H "Content-Type: application/json" -d '{"status":"APPROVED"}'
curl.exe -X POST "http://localhost:5000/api/tasks/TASK_ID/comments" -H "Authorization: Bearer YOUR_TEACHER_TOKEN" -H "Content-Type: application/json" -d '{"content":"Please clarify the project timeline."}'
curl.exe -X DELETE "http://localhost:5000/api/tasks/TASK_ID" -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

Valid task statuses are `PENDING`, `APPROVED`, and `NEEDS_REVISION`.

### Chat and messages

```powershell
curl.exe "http://localhost:5000/api/messages/groups" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X POST "http://localhost:5000/api/messages/groups" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"Team Chat","memberIds":["OTHER_USER_ID"]}'
curl.exe "http://localhost:5000/api/messages/groups/CHAT_GROUP_ID/messages" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X POST "http://localhost:5000/api/messages/groups/CHAT_GROUP_ID/messages" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"content":"Hello, team!"}'
```

### Notifications

```powershell
curl.exe "http://localhost:5000/api/notifications" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X PUT "http://localhost:5000/api/notifications/NOTIFICATION_ID/read" -H "Authorization: Bearer YOUR_TOKEN"
curl.exe -X PUT "http://localhost:5000/api/notifications/read-all" -H "Authorization: Bearer YOUR_TOKEN"
```
