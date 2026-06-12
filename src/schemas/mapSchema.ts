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

export const mapDetailResponseSchema = z.object({
    id: z.number().int().positive(),
    ownerId: z.number().int().positive(),
    ownerNickname: z.string().nullable(),
    title: z.string().min(1),
    description: z.string().nullable(),
    category: mapCategorySchema,
    numOfSong: z.number().int().min(0),
    totalPlayTime: z.number().int().min(0),
    isPublic: z.boolean(),
    pendingPublic: z.boolean(),
    playCount: z.number().int().min(0),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

export const mapItemResponseSchema = z.object({
    id: z.number().int().positive(),
    mapId: z.number().int().positive(),
    orderNum: z.number().int().positive(),
    youtubeUrl: z.string().min(1),
    videoId: z.string().min(1).nullable(),
    startTime: z.number().int().min(0),
    endTime: z.number().int().positive(),
    title: z.string().nullable(),
    artist: z.string().nullable(),
    thumbnailUrl: z.string().nullable(),
    answers: z.array(z.string().min(1)).min(1).max(5),
    hint: z.string().min(1),
    hintTime: z.number().int().min(1).max(100),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

export const mapItemListResponseSchema = z.array(mapItemResponseSchema);

export const manageMapResponseSchema = z.object({
    map: mapDetailResponseSchema,
    items: mapItemListResponseSchema,
});

export const createMapWithItemsResponseSchema = z.object({
    map: mapDetailResponseSchema,
    items: mapItemListResponseSchema,
});
