// 서버 응답을 그대로 믿지 않고 런타임 검증한다.

import { z } from 'zod';

export const authTokenSetSchema = z.object({
    accessToken: z.string().min(1),
    accessTokenExpiresAt: z.string().min(1),
    refreshToken: z.string().min(1),
    refreshTokenExpiresAt: z.string().min(1),
});

export const authSessionSchema = authTokenSetSchema.extend({
    userId: z.number().int().positive(),
    nickname: z.string().min(1),
    userType: z.enum(['REGISTERED', 'GUEST']),
    userIdentifier: z.uuid(),
});

export const guestSessionSchema = authSessionSchema;

export const refreshTokenResponseSchema = z.union([
    authSessionSchema,
    authTokenSetSchema,
]);
