import { z } from 'zod';

// Validation schemas - to be used in controllers
// Helper to transform role from frontend format to backend format
const roleTransform = z.enum(['student', 'teacher', 'super_admin']).transform((val) => {
  if (val === 'super_admin') return 'SUPER_ADMIN';
  if (val === 'teacher') return 'TEACHER';
  return 'STUDENT';
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: roleTransform,
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: roleTransform,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

