import { z } from 'zod';

// Validation schemas - to be used in controllers
// Maps signup and login role labels to Prisma's role values.
const roleTransform = z.enum(['student', 'teacher', 'super_admin']).transform((val) => {
  if (val === 'super_admin') return 'SUPER_ADMIN';
  if (val === 'teacher') return 'TEACHER';
  return 'STUDENT';
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').transform((email) => email.toLowerCase()),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: roleTransform,
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').transform((email) => email.toLowerCase()),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: roleTransform,
  signupKey: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

