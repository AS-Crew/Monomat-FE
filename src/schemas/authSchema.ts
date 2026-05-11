// 서버 응답을 그대로 믿지 않고 런타임 검증한다.

import { z } from 'zod';

export const guestSessionSchema = z.object({
    userId: z.number().int().positive(),
    nickname: z.string().min(1),
    userType: z.enum(['REGISTERED', 'GUEST']),
    userIdentifier: z.uuid(),
    accessToken: z.string().min(1),
    accessTokenExpiresAt: z.string().min(1),
    refreshToken: z.string().min(1),
    refreshTokenExpiresAt: z.string().min(1),
});