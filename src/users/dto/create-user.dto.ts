import { z } from 'zod';

export const createUserSchema = z
  .object({
    userID: z.string().min(5).max(15),
    password: z.string().min(5).max(20),
  })
  .required();

export type CreateUserDto = z.infer<typeof createUserSchema>;
