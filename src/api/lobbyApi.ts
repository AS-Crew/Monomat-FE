import { lobbyListSchema } from '../schemas/lobbySchema';
import type { Lobby } from '../types/lobby';

const LOBBY_API_ERROR_MESSAGES = {
    FETCH_FAILED: '로비 목록을 불러오는 데 실패했습니다.',
    INVALID_RESPONSE: '로비 목록 응답 형식이 올바르지 않습니다.',
} as const;

export async function fetchLobbyList(): Promise<Lobby[]> {
    const response = await fetch('/api/lobbies');

    if (!response.ok) {
        throw new Error(LOBBY_API_ERROR_MESSAGES.FETCH_FAILED);
    }

    const payload = await response.json() as unknown;
    const parsed = lobbyListSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[lobbyApi] 로비 목록 응답 검증 실패:', {
            payload,
            error: parsed.error,
        });

        throw new Error(LOBBY_API_ERROR_MESSAGES.INVALID_RESPONSE);
    }

    return parsed.data;
}