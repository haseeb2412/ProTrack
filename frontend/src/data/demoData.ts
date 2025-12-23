import { Student, Teacher, Group, Task, Project, TaskComment } from '@/types';

// Demo Projects
export const demoProjects: Project[] = [
  { id: 'p-001', name: 'AI-Powered Healthcare System', description: 'Machine learning for medical diagnosis', createdAt: new Date('2024-01-10') },
  { id: 'p-002', name: 'Smart Campus IoT Network', description: 'IoT sensors for campus management', createdAt: new Date('2024-01-12') },
  { id: 'p-003', name: 'E-Learning Platform', description: 'Interactive online learning system', createdAt: new Date('2024-01-15') },
  { id: 'p-004', name: 'Blockchain Voting System', description: 'Secure digital voting platform', createdAt: new Date('2024-01-18') },
];

// Demo Teachers
export const demoTeachers: Teacher[] = [
  { id: 't-001', name: 'Prof. Sarah Wilson', email: 'sarah.wilson@protrack.edu', role: 'teacher', designation: 'Associate Professor', department: 'Computer Science', assignedGroups: ['g-001', 'g-002'], createdAt: new Date('2024-01-01') },
  { id: 't-002', name: 'Dr. Michael Chen', email: 'michael.chen@protrack.edu', role: 'teacher', designation: 'Assistant Professor', department: 'Software Engineering', assignedGroups: ['g-003'], createdAt: new Date('2024-01-02') },
  { id: 't-003', name: 'Prof. Emily Davis', email: 'emily.davis@protrack.edu', role: 'teacher', designation: 'Professor', department: 'Data Science', assignedGroups: ['g-004'], createdAt: new Date('2024-01-03') },
  { id: 't-004', name: 'Dr. James Brown', email: 'james.brown@protrack.edu', role: 'teacher', designation: 'Senior Lecturer', department: 'Information Systems', assignedGroups: [], createdAt: new Date('2024-01-04') },
];

// Demo Students
export const demoStudents: Student[] = [
  { id: 's-001', name: 'Alex Johnson', email: 'alex.johnson@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-001', groupId: 'g-001', createdAt: new Date('2024-02-01') },
  { id: 's-002', name: 'Emma Williams', email: 'emma.williams@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-002', groupId: 'g-001', createdAt: new Date('2024-02-01') },
  { id: 's-003', name: 'Ryan Martinez', email: 'ryan.martinez@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-003', groupId: 'g-001', createdAt: new Date('2024-02-01') },
  { id: 's-004', name: 'Sophie Anderson', email: 'sophie.anderson@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-004', groupId: 'g-001', createdAt: new Date('2024-02-01') },
  { id: 's-005', name: 'David Lee', email: 'david.lee@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-005', groupId: 'g-002', createdAt: new Date('2024-02-02') },
  { id: 's-006', name: 'Olivia Taylor', email: 'olivia.taylor@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-006', groupId: 'g-002', createdAt: new Date('2024-02-02') },
  { id: 's-007', name: 'Chris Wilson', email: 'chris.wilson@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-007', groupId: 'g-002', createdAt: new Date('2024-02-02') },
  { id: 's-008', name: 'Mia Garcia', email: 'mia.garcia@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-008', groupId: 'g-003', createdAt: new Date('2024-02-03') },
  { id: 's-009', name: 'Jake Robinson', email: 'jake.robinson@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-009', groupId: 'g-003', createdAt: new Date('2024-02-03') },
  { id: 's-010', name: 'Ava Thompson', email: 'ava.thompson@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-010', groupId: 'g-003', createdAt: new Date('2024-02-03') },
  { id: 's-011', name: 'Noah Harris', email: 'noah.harris@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-011', groupId: 'g-004', createdAt: new Date('2024-02-04') },
  { id: 's-012', name: 'Isabella Clark', email: 'isabella.clark@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-012', groupId: 'g-004', createdAt: new Date('2024-02-04') },
  { id: 's-013', name: 'Liam Walker', email: 'liam.walker@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-013', createdAt: new Date('2024-02-05') },
  { id: 's-014', name: 'Charlotte King', email: 'charlotte.king@student.edu', role: 'student', designation: 'Final Year Student', enrollmentId: 'STU-2021-014', createdAt: new Date('2024-02-05') },
];

// Demo Groups
export const demoGroups: Group[] = [
  {
    id: 'g-001',
    name: 'Team Alpha',
    projectId: 'p-001',
    projectName: 'AI-Powered Healthcare System',
    teacherId: 't-001',
    teacherName: 'Prof. Sarah Wilson',
    studentIds: ['s-001', 's-002', 's-003', 's-004'],
    students: [
      { id: 's-001', name: 'Alex Johnson' },
      { id: 's-002', name: 'Emma Williams' },
      { id: 's-003', name: 'Ryan Martinez' },
      { id: 's-004', name: 'Sophie Anderson' },
    ],
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'g-002',
    name: 'Team Beta',
    projectId: 'p-002',
    projectName: 'Smart Campus IoT Network',
    teacherId: 't-001',
    teacherName: 'Prof. Sarah Wilson',
    studentIds: ['s-005', 's-006', 's-007'],
    students: [
      { id: 's-005', name: 'David Lee' },
      { id: 's-006', name: 'Olivia Taylor' },
      { id: 's-007', name: 'Chris Wilson' },
    ],
    createdAt: new Date('2024-02-11'),
  },
  {
    id: 'g-003',
    name: 'Team Gamma',
    projectId: 'p-003',
    projectName: 'E-Learning Platform',
    teacherId: 't-002',
    teacherName: 'Dr. Michael Chen',
    studentIds: ['s-008', 's-009', 's-010'],
    students: [
      { id: 's-008', name: 'Mia Garcia' },
      { id: 's-009', name: 'Jake Robinson' },
      { id: 's-010', name: 'Ava Thompson' },
    ],
    createdAt: new Date('2024-02-12'),
  },
  {
    id: 'g-004',
    name: 'Team Delta',
    projectId: 'p-004',
    projectName: 'Blockchain Voting System',
    teacherId: 't-003',
    teacherName: 'Prof. Emily Davis',
    studentIds: ['s-011', 's-012'],
    students: [
      { id: 's-011', name: 'Noah Harris' },
      { id: 's-012', name: 'Isabella Clark' },
    ],
    createdAt: new Date('2024-02-13'),
  },
];

// Demo Tasks
export const demoTasks: Task[] = [
  {
    id: 'task-001',
    name: 'Project Proposal Document',
    description: 'Complete the initial project proposal with objectives, scope, and timeline.',
    studentId: 's-001',
    studentName: 'Alex Johnson',
    groupId: 'g-001',
    fileName: 'proposal_v1.pdf',
    status: 'approved',
    comments: [
      { id: 'c-001', taskId: 'task-001', authorId: 't-001', authorName: 'Prof. Sarah Wilson', authorRole: 'teacher', content: 'Excellent work! The proposal is well-structured and comprehensive.', createdAt: new Date('2024-02-20') },
    ],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: 'task-002',
    name: 'Database Schema Design',
    description: 'Design the complete database schema with ER diagrams and table definitions.',
    studentId: 's-001',
    studentName: 'Alex Johnson',
    groupId: 'g-001',
    fileName: 'database_schema.zip',
    status: 'pending',
    comments: [],
    createdAt: new Date('2024-02-22'),
    updatedAt: new Date('2024-02-22'),
  },
  {
    id: 'task-003',
    name: 'UI/UX Wireframes',
    description: 'Create wireframes for all main screens of the application.',
    studentId: 's-002',
    studentName: 'Emma Williams',
    groupId: 'g-001',
    fileName: 'wireframes.fig',
    status: 'needs_revision',
    comments: [
      { id: 'c-002', taskId: 'task-003', authorId: 't-001', authorName: 'Prof. Sarah Wilson', authorRole: 'teacher', content: 'Good start, but please add more detail to the dashboard screens.', createdAt: new Date('2024-02-25') },
    ],
    createdAt: new Date('2024-02-23'),
    updatedAt: new Date('2024-02-25'),
  },
  {
    id: 'task-004',
    name: 'API Documentation',
    description: 'Document all REST API endpoints with request/response examples.',
    studentId: 's-003',
    studentName: 'Ryan Martinez',
    groupId: 'g-001',
    status: 'pending',
    comments: [],
    createdAt: new Date('2024-02-24'),
    updatedAt: new Date('2024-02-24'),
  },
  {
    id: 'task-005',
    name: 'Frontend Development - Login Module',
    description: 'Implement the login and authentication module for the frontend.',
    studentId: 's-005',
    studentName: 'David Lee',
    groupId: 'g-002',
    fileName: 'login_module.zip',
    status: 'approved',
    comments: [
      { id: 'c-003', taskId: 'task-005', authorId: 't-001', authorName: 'Prof. Sarah Wilson', authorRole: 'teacher', content: 'Perfect implementation with proper error handling.', createdAt: new Date('2024-02-28') },
    ],
    createdAt: new Date('2024-02-26'),
    updatedAt: new Date('2024-02-28'),
  },
];
