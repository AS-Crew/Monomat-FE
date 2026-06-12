import { API_ENDPOINTS } from '../constants/endpoints';
import { lobbyRecentChatResponseSchema } from '../schemas/lobbyChatSchema';
import { fetchWithAuth } from './apiClient';
import { createApiError } from './apiError';

import type { LobbyChatMessage } from '../types/lobbyChat';

const DEFAULT_FETCH_RECENT_CHATS_ERROR_MESSAGE =
    '최근 채팅을 불러오는 데 실패했습니다.';

export async function getRecentLobbyChats(
    inviteCode: string,
): Promise<LobbyChatMessage[]> {
    const response = await fetchWithAuth(
        API_ENDPOINTS.LOBBY.RECENT_CHATS(inviteCode),
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_FETCH_RECENT_CHATS_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = lobbyRecentChatResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[lobbyChatApi] 최근 채팅 응답 검증 실패:',
            parsed.error,
        );

        throw new Error('최근 채팅 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}
