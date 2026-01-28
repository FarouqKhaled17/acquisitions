import z from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().trim(),
  password: z.string().min(8).max(255).trim(),
}
);

export const loginSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(8).max(255).trim(),
});