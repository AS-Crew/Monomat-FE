import { z } from 'zod';

import { STOMP_ERROR_ACTIONS } from '../types/socket';

import type { StompErrorPayload } from '../types/socket';

const FALLBACK_STOMP_ERROR_MESSAGE =
    'WebSocket 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

export const stompErrorPayloadSchema = z.object({
    type: z.literal('STOMP_ERROR'),
    code: z.string().min(1),
    message: z.string(),
    action: z.enum(STOMP_ERROR_ACTIONS),
    recoverable: z.boolean(),
    timestamp: z.string().min(1),
});

export function createFallbackStompErrorPayload(): StompErrorPayload {
    return {
        type: 'STOMP_ERROR',
        code: 'MALFORMED_STOMP_ERROR',
        message: FALLBACK_STOMP_ERROR_MESSAGE,
        action: 'RETRY_CONNECT',
        recoverable: true,
        timestamp: new Date().toISOString(),
    };
}

export function parseStompErrorPayload(body: string | undefined) {
    if (!body?.trim()) {
        return createFallbackStompErrorPayload();
    }

    try {
        const payload = JSON.parse(body) as unknown;
        const parsed = stompErrorPayloadSchema.safeParse(payload);

        if (!parsed.success) {
            return createFallbackStompErrorPayload();
        }

        return parsed.data;
    } catch {
        return createFallbackStompErrorPayload();
    }
}

