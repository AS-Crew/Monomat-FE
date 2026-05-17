import { API_ENDPOINTS } from '../constants/endpoints';
import { joinLobbyResponseSchema } from '../schemas/lobbySchema';

import type {
    JoinLobbyRequest,
    JoinLobbyResponse,
} from '../types/lobby';

const JSON_CONTENT_TYPE = 'application/json';

const DEFAULT_JOIN_LOBBY_ERROR_MESSAGE = '로비 입장에 실패했습니다.';

async function parseErrorMessage(response: Response): Promise<string> {
    try {
        const payload = (await response.json()) as {
            message?: string;
            error?: string;
        };

        return (
            payload.message ??
            payload.error ??
            DEFAULT_JOIN_LOBBY_ERROR_MESSAGE
        );
    } catch {
        return DEFAULT_JOIN_LOBBY_ERROR_MESSAGE;
    }
}

export async function joinLobbyByInviteCode(
    request: JoinLobbyRequest,
): Promise<JoinLobbyResponse> {
    const response = await fetch(API_ENDPOINTS.LOBBY.JOIN, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }

    const payload = (await response.json()) as unknown;
    const parsed = joinLobbyResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[lobbyApi] 로비 입장 응답 검증 실패:',
            parsed.error,
        );

        throw new Error('로비 입장 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}