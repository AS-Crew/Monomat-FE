import { z } from 'zod';

import { lobbyCategorySchema } from './lobbySchema';

export const mapCategorySchema = lobbyCategorySchema;

export const mapSortOptionSchema = z.enum([
    'NEWEST',
    'OLDEST',
    'MOST_SONGS',
    'TITLE_ASC',
]);

export const mapSummaryResponseSchema = z.object({
    mapId: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().nullable(),
    category: mapCategorySchema,
    numOfSong: z.number().int().min(0),
    totalPlayTime: z.number().int().min(0),
    playCount: z.number().int().min(0).optional(),
    isPublic: z.boolean(),
    pendingPublic: z.boolean(),
    ownerId: z.number().int().positive(),
    ownerNickname: z.string().nullable(),
});

export const mapPageResponseSchema = z.object({
    content: z.array(mapSummaryResponseSchema),
    page: z.number().int().min(0),
    size: z.number().int().positive(),
    totalElements: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
});
