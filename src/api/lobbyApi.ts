import { API_ENDPOINTS } from '../constants/endpoints';
import { fetchWithAuth } from './apiClient';
import { createApiError } from './apiError';
import {
    createLobbyResponseSchema,
    joinLobbyResponseSchema,
    lobbyDetailResponseSchema,
    lobbyListResponseSchema,
} from '../schemas/lobbySchema';

import type {
    CreateLobbyRequest,
    CreateLobbyResponse,
    JoinLobbyRequest,
    JoinLobbyResponse,
    LobbyDetailResponse,
    LobbyListItem,
    LobbyListQueryParams,
    LobbyPageResponse,
    UpdateLobbyReadyRequest,
} from '../types/lobby';

const JSON_CONTENT_TYPE = 'application/json';

const DEFAULT_CREATE_LOBBY_ERROR_MESSAGE = '로비 생성에 실패했습니다.';
const DEFAULT_JOIN_LOBBY_ERROR_MESSAGE = '로비 입장에 실패했습니다.';
const DEFAULT_FETCH_LOBBY_LIST_ERROR_MESSAGE = '로비 목록을 불러오는 데 실패했습니다.';
const DEFAULT_FETCH_LOBBY_DETAIL_ERROR_MESSAGE = '로비 정보를 불러오는 데 실패했습니다.';
const DEFAULT_UPDATE_LOBBY_READY_ERROR_MESSAGE = '준비 상태 변경에 실패했습니다.';
const DEFAULT_START_LOBBY_GAME_ERROR_MESSAGE = '게임 시작에 실패했습니다.';

function appendNonEmptyParam(
    searchParams: URLSearchParams,
    key: string,
    value: string | undefined,
) {
    const trimmedValue = value?.trim();

    if (trimmedValue) {
        searchParams.set(key, trimmedValue);
    }
}

function appendNumberParam(
    searchParams: URLSearchParams,
    key: string,
    value: number | undefined,
) {
    if (typeof value === 'number') {
        searchParams.set(key, String(value));
    }
}

function createLobbyListUrl(params: LobbyListQueryParams = {}) {
    const searchParams = new URLSearchParams();

    appendNonEmptyParam(searchParams, 'keyword', params.keyword);
    appendNonEmptyParam(searchParams, 'mapCategory', params.mapCategory);
    appendNonEmptyParam(searchParams, 'sort', params.sort);
    appendNumberParam(searchParams, 'page', params.page);
    appendNumberParam(searchParams, 'size', params.size);

    const queryString = searchParams.toString();

    return queryString
        ? `${API_ENDPOINTS.LOBBY.LIST}?${queryString}`
        : API_ENDPOINTS.LOBBY.LIST;
}

export async function fetchLobbyList(
    params?: LobbyListQueryParams,
): Promise<LobbyPageResponse<LobbyListItem>> {
    const response = await fetchWithAuth(createLobbyListUrl(params));

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

export async function createLobby(
    request: CreateLobbyRequest,
): Promise<CreateLobbyResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.LOBBY.CREATE, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_CREATE_LOBBY_ERROR_MESSAGE,
        );
    }

    const payload = (await response.json()) as unknown;
    const parsed = createLobbyResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[lobbyApi] 로비 생성 응답 검증 실패:',
            parsed.error,
        );

        throw new Error('로비 생성 응답 형식이 올바르지 않습니다.');
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

export async function getLobbyDetail(
    code: string,
): Promise<LobbyDetailResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.LOBBY.DETAIL(code));

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_FETCH_LOBBY_DETAIL_ERROR_MESSAGE,
        );
    }

    const payload = (await response.json()) as unknown;
    const parsed = lobbyDetailResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[lobbyApi] 로비 상세 응답 검증 실패:',
            parsed.error,
        );

        throw new Error('로비 상세 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function updateLobbyReady(
    code: string,
    request: UpdateLobbyReadyRequest,
): Promise<void> {
    const response = await fetchWithAuth(API_ENDPOINTS.LOBBY.READY(code), {
        method: 'PATCH',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_UPDATE_LOBBY_READY_ERROR_MESSAGE,
        );
    }
}

export async function startLobbyGame(code: string): Promise<void> {
    const response = await fetchWithAuth(API_ENDPOINTS.LOBBY.START(code), {
        method: 'POST',
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_START_LOBBY_GAME_ERROR_MESSAGE,
        );
    }
}
