import { z } from 'zod';

export const lobbyCategorySchema = z.enum(['K-POP', 'J-POP', 'POP', 'OST']);

export const joinLobbyResponseSchema = z.object({
    inviteCode: z.string().regex(/^[A-Z0-9]{6}$/),
    title: z.string().min(1),
    hostId: z.string().min(1),
    maxPlayers: z.number().int().positive(),
    currentPlayers: z.number().int().min(0),
    status: z.enum(['WAITING', 'PLAYING']),
    mapId: z.number().int().positive().nullable(),
    mapTitle: z.string().min(1).nullable(),
    mapCategory: lobbyCategorySchema.nullable(),
});

export const lobbySchema = z.object({
    code: z.string().min(1),
    hostId: z.string().min(1),
    title: z.string().min(1),
    mapId: z.number().int().positive().nullable(),
    mapCategory: lobbyCategorySchema.nullable(),
    maxPlayers: z.number().int().positive(),
    currentPlayers: z.number().int().min(0),
    isPrivate: z.boolean(),
    status: z.enum(['WAITING', 'PLAYING']),
});

export const lobbyListResponseSchema = z.array(lobbySchema);
