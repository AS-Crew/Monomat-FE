import { z } from 'zod';

export const lobbyCategorySchema = z.enum(['K-POP', 'J-POP', 'POP']);

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
    hostId: z.string().min(1),
    title: z.string().min(1),
    mapId: z.number().int().positive().nullable(),
    mapTitle: z.string().min(1).nullable(),
    mapCategory: lobbyCategorySchema.nullable(),
    maxPlayers: z.number().int().positive(),
    currentPlayers: z.number().int().min(0),
    isPrivate: z.boolean(),
    status: lobbyStatusSchema,
    createdAtEpochMillis: z.number().int().nonnegative().nullable(),
});

export const lobbyPlayerResponseSchema = z.object({
    userIdentifier: z.string().min(1),
    host: z.boolean(),
    ready: z.boolean(),
});

export const lobbyDetailResponseSchema = z.object({
    inviteCode: z.string().min(1),
    title: z.string().min(1),
    hostId: z.string().min(1),
    maxPlayers: z.number().int().positive(),
    currentPlayers: z.number().int().min(0),
    status: lobbyStatusSchema,
    mapId: z.number().int().positive().nullable(),
    mapTitle: z.string().min(1).nullable(),
    mapCategory: lobbyCategorySchema.nullable(),
    roundCount: z.number().int().positive(),
    timeLimitSeconds: z.number().int().positive(),
    players: z.array(lobbyPlayerResponseSchema),
    canStart: z.boolean(),
});

export const lobbyPageResponseSchema = z.object({
    items: z.array(lobbyListItemSchema),
    page: z.number().int().min(0),
    size: z.number().int().positive(),
    hasNext: z.boolean(),
});

export const lobbyListResponseSchema = lobbyPageResponseSchema;
