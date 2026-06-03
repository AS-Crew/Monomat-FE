import { z } from 'zod';

export const userStatusSchema = z.enum(['ACTIVE', 'BANNED', 'DELETED']);

export const myUserInfoResponseSchema = z.object({
    userId: z.number().int().positive(),
    username: z.string().min(1),
    userType: z.enum(['REGISTERED', 'GUEST']),
    status: userStatusSchema,
    createdAt: z.string().min(1),
});
