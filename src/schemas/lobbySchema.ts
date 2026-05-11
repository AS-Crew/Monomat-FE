import { z } from 'zod';

export const lobbyCategorySchema = z
    .enum(['K-POP', 'J-POP', 'POP', 'OST'])
    .nullable()
    .catch(null);

export const lobbySchema = z.object({
    code: z.string().min(1),
    hostId: z.string().min(1),
    title: z.string().catch(''),
    mapId: z.number().nullable().catch(null),
    mapTitle: z.string().nullable().optional().catch(null),

    /**
     * BE 응답 기준 로비 카테고리는 로비 자체가 아니라
     * 로비에 연결된 맵의 카테고리입니다.
     */
    mapCategory: lobbyCategorySchema,

    maxPlayers: z.number().int().positive(),
    currentPlayers: z.number().int().min(0).optional().catch(0),
    isPrivate: z.boolean(),
    status: z.enum(['WAITING', 'PLAYING']),
});

export const lobbyListSchema = z.array(lobbySchema);