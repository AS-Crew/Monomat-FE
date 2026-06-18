import { z } from 'zod';

import { GAME_INPUT_POLICY } from '../constants/game';

export const gameRoundEndReasonSchema = z.enum([
    'TIMEOUT',
    'SKIP_VOTE',
    'HOST_SKIP',
    'PLAYBACK_ERROR',
]);

export const gamePlayerRankingSchema = z.object({
    userIdentifier: z.string().min(1),
    nickname: z.string().min(1),
    score: z.number().int(),
    rank: z.number().int().positive(),
    scoreAdded: z.number().int(),
});

const gameRoundReadyEventSchema = z.object({
    type: z.literal('ROUND_READY'),
    videoId: z.string().min(1),
    youtubeUrl: z.string().min(1),
    startTime: z.number().int().nonnegative(),
    timeLimitSeconds: z.number().int().positive(),
    roundNo: z.number().int().positive(),
    serverStartedAt: z.number().int().nonnegative(),
});

const gameRoundPlaybackStartedEventSchema = z.object({
    type: z.literal('ROUND_PLAYBACK_STARTED'),
    roundNo: z.number().int().positive(),
    serverStartedAt: z.number().int().nonnegative(),
    durationSeconds: z.number().int().positive(),
});

const gameRoundSkipVoteEventSchema = z.object({
    type: z.literal('ROUND_SKIP_VOTE'),
    roundNo: z.number().int().positive(),
    votes: z.number().int().nonnegative(),
    requiredVotes: z.number().int().nonnegative(),
    totalParticipants: z.number().int().nonnegative(),
});

const gameRoundSkippedEventSchema = z.object({
    type: z.literal('ROUND_SKIPPED'),
    roundNo: z.number().int().positive(),
    endReason: gameRoundEndReasonSchema,
});

export const gameRoundEventSchema = z.discriminatedUnion('type', [
    gameRoundReadyEventSchema,
    gameRoundPlaybackStartedEventSchema,
    gameRoundSkipVoteEventSchema,
    gameRoundSkippedEventSchema,
]);

export const gameRoundEndEventSchema = z.object({
    type: z.literal('ROUND_END'),
    title: z.string(),
    artist: z.string(),
    answer: z.string(),
    thumbnailUrl: z.string(),
    rankings: z.array(gamePlayerRankingSchema),
    waitTimeSeconds: z.number().int().nonnegative(),
    isLastRound: z.boolean(),
    endReason: gameRoundEndReasonSchema,
});

const gameChatMessageBaseSchema = z.object({
    roomId: z.string().nullish(),
    sender: z.string().nullish(),
    senderNickname: z.string().nullish(),
    content: z.string(),
    timestamp: z.string().nullish(),
    sentAt: z.string().nullish(),
});

const gameChatEventSchema = gameChatMessageBaseSchema
    .extend({
        type: z.literal('CHAT'),
    })
    .refine(
        (message) =>
            Boolean(
                message.sender?.trim() ||
                message.senderNickname?.trim(),
            ),
        {
            message: 'CHAT 메시지에는 발신자 정보가 필요합니다.',
            path: ['sender'],
        },
    );

const gameSystemMessageSchema = gameChatMessageBaseSchema.extend({
    type: z.literal('SYSTEM'),
});

export const gameChatMessageSchema = z
    .union([gameChatEventSchema, gameSystemMessageSchema])
    .transform((message) => ({
        type: message.type,
        roomId: message.roomId?.trim() ?? '',
        sender:
            message.type === 'SYSTEM'
                ? message.sender?.trim() ||
                  message.senderNickname?.trim() ||
                  'SYSTEM'
                : message.sender?.trim() ||
                  message.senderNickname?.trim() ||
                  '',
        content: message.content,
        timestamp:
            message.timestamp?.trim() ||
            message.sentAt?.trim() ||
            new Date().toISOString(),
    }));

export const gameInputRequestSchema = z.object({
    roundNo: z.number().int().positive(),
    content: z
        .string()
        .trim()
        .min(1)
        .max(GAME_INPUT_POLICY.MAX_MESSAGE_LENGTH),
});

export const gameRoundCorrectEventSchema = z.object({
    type: z.literal('ROUND_CORRECT'),
    roundNo: z.number().int().positive(),
    isFuzzy: z.boolean(),
    message: z.string(),
});

export const currentGameRoundStatusSchema = z.object({
    roundNo: z.number().int().positive(),
    status: z.string().min(1),
    roundPhase: z.string().min(1),
    timeLimitSeconds: z.number().int().positive(),
    serverStartedAt: z.number().int().nonnegative().nullable(),
    videoId: z.string().min(1).nullable(),
    youtubeUrl: z.string().min(1).nullable(),
    startTime: z.number().int().nonnegative().nullable(),
    remainingSeconds: z.number().int().nonnegative().nullable(),
    isCorrect: z.boolean(),
});
