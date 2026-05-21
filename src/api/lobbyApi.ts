import { API_ENDPOINTS } from '../constants/endpoints';
import { fetchWithAuth } from './apiClient';
import { createApiError } from './apiError';
import {
    joinLobbyResponseSchema,
    lobbyListResponseSchema,
} from '../schemas/lobbySchema';

import type {
    JoinLobbyRequest,
    JoinLobbyResponse,
    Lobby,
} from '../types/lobby';

const JSON_CONTENT_TYPE = 'application/json';

const DEFAULT_JOIN_LOBBY_ERROR_MESSAGE = '로비 입장에 실패했습니다.';
const DEFAULT_FETCH_LOBBY_LIST_ERROR_MESSAGE = '로비 목록을 불러오는 데 실패했습니다.';

export async function fetchLobbyList(): Promise<Lobby[]> {
    const response = await fetchWithAuth(API_ENDPOINTS.LOBBY.LIST);

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_FETCH_LOBBY_LIST_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = lobbyListResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[lobbyApi] 로비 목록 응답 검증 실패:',
            parsed.error,
        );

        throw new Error('로비 목록 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function joinLobbyByInviteCode(
    request: JoinLobbyRequest,
): Promise<JoinLobbyResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.LOBBY.JOIN, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_JOIN_LOBBY_ERROR_MESSAGE,
        );
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
