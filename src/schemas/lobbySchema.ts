import { z } from 'zod';

export const lobbyCategorySchema = z.enum([
    'K-POP',
    'J-POP',
    'POP',
    'OST',
    '애니',
]);

export const lobbyStatusSchema = z.string().min(1);

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

export const createLobbyResponseSchema = z.object({
    lobbyId: z.number().int().positive(),
    inviteCode: z.string().regex(/^[A-Z0-9]{6}$/),
    title: z.string().min(1),
    maxPlayers: z.number().int().min(2).max(8),
    isPrivate: z.boolean(),
    status: lobbyStatusSchema,
    mapId: z.number().int().positive().nullable(),
    mapTitle: z.string().min(1).nullable(),
    mapCategory: lobbyCategorySchema.nullable(),
});

export const lobbyListItemSchema = z.object({
    code: z.string().min(1),
    hostId: z.string().min(1).nullable().optional(),
    hostNickname: z.string().nullable().optional(),
    title: z.string().min(1),
    mapId: z.number().int().positive().nullable(),
    mapTitle: z.string().min(1).nullable(),
    mapCategory: lobbyCategorySchema.nullable(),
    maxPlayers: z.number().int().positive(),
    currentPlayers: z.number().int().min(0),
    isPrivate: z.boolean(),
    status: lobbyStatusSchema,
    questionCount: z.number().int().positive().nullable().optional(),
    timeLimitSeconds: z.number().int().positive().nullable().optional(),
    createdAtEpochMillis: z.number().int().nonnegative().nullable(),
});

export const lobbyPlayerResponseSchema = z.object({
    userIdentifier: z.string().min(1),
    nickname: z.string().nullable().optional(),
    host: z.boolean(),
    ready: z.boolean(),
});

export const lobbyDetailResponseSchema = z.object({
    inviteCode: z.string().min(1),
    title: z.string().min(1),
    hostId: z.string().min(1),
    hostNickname: z.string().nullable().optional(),
    maxPlayers: z.number().int().positive(),
    currentPlayers: z.number().int().min(0),
    status: lobbyStatusSchema,
    mapId: z.number().int().positive().nullable(),
    mapTitle: z.string().min(1).nullable(),
    mapCategory: lobbyCategorySchema.nullable(),
    questionCount: z.number().int().positive(),
    timeLimitSeconds: z.number().int().positive(),
    players: z.array(lobbyPlayerResponseSchema),
    canStart: z.boolean(),
});

export const lobbyPageResponseSchema = z.object({
    items: z.array(lobbyListItemSchema),
    page: z.number().int().min(0),
    size: z.number().int().positive(),
    totalElements: z.number().int().min(0).optional(),
    totalPages: z.number().int().min(0).optional(),
    hasNext: z.boolean(),
});

export const lobbyListResponseSchema = lobbyPageResponseSchema;
