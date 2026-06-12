import { z } from 'zod';

const lobbySystemMessageTypeSchema = z.enum([
    'SYSTEM',
    'ENTER',
    'LEAVE',
    'KICK',
    'READY_CHANGED',
    'HOST_CHANGED',
]);

const lobbyChatMessageBaseSchema = z.object({
    roomId: z.string().min(1).optional(),
    sender: z.string().min(1).optional(),
    content: z.string(),
    timestamp: z.string().min(1).optional(),
});

const lobbyUserChatMessageSchema = lobbyChatMessageBaseSchema.extend({
    messageId: z.string().min(1),
    type: z.literal('CHAT'),
    roomId: z.string().min(1),
    sender: z.string().min(1),
    senderId: z.number().int().positive(),
    senderNickname: z.string().optional(),
    sentAt: z.string().min(1),
});

const lobbySystemChatMessageSchema = lobbyChatMessageBaseSchema.extend({
    messageId: z.string().min(1).optional(),
    type: lobbySystemMessageTypeSchema,
    senderId: z.number().int().positive().optional(),
    senderNickname: z.string().optional(),
    sentAt: z.string().min(1).optional(),
});

export const lobbyChatMessageSchema = z.union([
    lobbyUserChatMessageSchema,
    lobbySystemChatMessageSchema,
]);

export const lobbyRecentChatResponseSchema = z.array(lobbyChatMessageSchema);
