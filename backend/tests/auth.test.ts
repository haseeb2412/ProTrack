import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import authRoutes from '../src/routes/auth.routes';
import { errorHandler } from '../src/middleware/errorHandler';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn(), create: vi.fn() },
    teacher: { create: vi.fn() },
    student: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/database/prisma', () => ({ default: prismaMock }));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

const jwtSecret = 'auth-tests-secret';
const transactionClient = {
  user: { create: prismaMock.user.create },
  teacher: { create: prismaMock.teacher.create },
  student: { create: prismaMock.student.create },
};

const makeUser = (role: 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN') => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role,
  designation: role === 'STUDENT'
    ? 'Final Year Student'
    : role === 'TEACHER'
      ? 'Professor'
      : 'System Administrator',
  avatar: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  teacherProfile: null,
  studentProfile: null,
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('JWT_SECRET', jwtSecret);
  vi.stubEnv('SUPER_ADMIN_SIGNUP_KEY', 'test-signup-key');
  prismaMock.$transaction.mockImplementation((callback: (tx: typeof transactionClient) => Promise<unknown>) =>
    callback(transactionClient),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/auth/signup', () => {
  // Checks that student signup hashes the password, creates a student profile, and returns a token.
  it('creates a student account', async () => {
    const user = makeUser('STUDENT');
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(user);

    const response = await request(app).post('/api/auth/signup').send({
      name: 'Test User', email: 'TEST@example.com', password: 'pass1234', role: 'student',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(jwt.verify(response.body.data.token, jwtSecret)).toMatchObject({ id: user.id, role: 'STUDENT' });
    const createCall = prismaMock.user.create.mock.calls[0][0];
    expect(await bcrypt.compare('pass1234', createCall.data.password)).toBe(true);
    expect(prismaMock.student.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: user.id, enrollmentId: expect.stringMatching(/^STU-\d{4}-[A-F0-9]{8}$/) }),
    });
  });

  // Checks that teacher signup creates its teacher profile as part of the account transaction.
  it('creates a teacher profile during teacher signup', async () => {
    const user = makeUser('TEACHER');
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(user);

    const response = await request(app).post('/api/auth/signup').send({
      name: 'Test Teacher', email: 'teacher@example.com', password: 'pass1234', role: 'teacher',
    });

    expect(response.status).toBe(201);
    expect(prismaMock.teacher.create).toHaveBeenCalledWith({ data: { userId: user.id, department: 'Computer Science' } });
    expect(prismaMock.student.create).not.toHaveBeenCalled();
  });

  // Checks that a super-admin can sign up only with the configured signup key.
  it('creates a super-admin account with the correct signup key', async () => {
    const user = makeUser('SUPER_ADMIN');
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(user);

    const response = await request(app).post('/api/auth/signup').send({
      name: 'Test Admin', email: 'admin@example.com', password: 'pass1234',
      role: 'super_admin', signupKey: 'test-signup-key',
    });

    expect(response.status).toBe(201);
    expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: 'SUPER_ADMIN', designation: 'System Administrator' }),
    }));
  });

  // Checks that duplicate accounts are rejected before a new database transaction starts.
  it('rejects an existing email and role combination', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'existing-user' });

    const response = await request(app).post('/api/auth/signup').send({
      name: 'Test User', email: 'test@example.com', password: 'pass1234', role: 'student',
    });

    expect(response.status).toBe(409);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  // Checks that signup validation rejects malformed email or too-short password input.
  it('rejects invalid signup input', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      name: 'T', email: 'not-an-email', password: '123', role: 'student',
    });

    expect(response.status).toBe(400);
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  // Checks that an incorrect super-admin signup key is rejected without creating an account.
  it('rejects a super-admin signup with the wrong key', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      name: 'Test Admin', email: 'admin@example.com', password: 'pass1234',
      role: 'super_admin', signupKey: 'wrong-key',
    });

    expect(response.status).toBe(403);
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  // Checks that missing super-admin key configuration is reported as a server configuration error.
  it('reports when the super-admin signup key is not configured', async () => {
    vi.stubEnv('SUPER_ADMIN_SIGNUP_KEY', '');

    const response = await request(app).post('/api/auth/signup').send({
      name: 'Test Admin', email: 'admin@example.com', password: 'pass1234', role: 'super_admin',
    });

    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('SUPER_ADMIN_SIGNUP_KEY is not configured');
  });
});

describe('POST /api/auth/login', () => {
  // Checks that valid credentials return the user and a JWT without exposing the stored password hash.
  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('pass1234', 4);
    const user = { ...makeUser('TEACHER'), password: passwordHash };
    prismaMock.user.findFirst.mockResolvedValue(user);

    const response = await request(app).post('/api/auth/login').send({
      email: 'TEST@example.com', password: 'pass1234', role: 'teacher',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(jwt.verify(response.body.data.token, jwtSecret)).toMatchObject({ id: user.id, role: 'TEACHER' });
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'test@example.com', role: 'TEACHER' },
    }));
  });

  // Checks that a wrong password returns the same generic authentication error as an unknown account.
  it('rejects an incorrect password', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ ...makeUser('STUDENT'), password: await bcrypt.hash('different-password', 4) });

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'pass1234', role: 'student',
    });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Invalid email, password, or role');
  });

  // Checks that login rejects an email and role combination that does not exist.
  it('rejects an unknown account', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const response = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com', password: 'pass1234', role: 'student',
    });

    expect(response.status).toBe(401);
  });

  // Checks that login validation rejects malformed email or too-short password input.
  it('rejects invalid login input', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'not-an-email', password: '123', role: 'student',
    });

    expect(response.status).toBe(400);
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  // Checks that login reports missing JWT configuration instead of returning a token.
  it('reports when the JWT secret is not configured', async () => {
    const user = { ...makeUser('STUDENT'), password: await bcrypt.hash('pass1234', 4) };
    prismaMock.user.findFirst.mockResolvedValue(user);
    vi.stubEnv('JWT_SECRET', '');

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'pass1234', role: 'student',
    });

    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('JWT_SECRET is not configured');
  });
});
