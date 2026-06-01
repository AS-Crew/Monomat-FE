/**
 * 로비 목록 조회 요청을 가로채서 Mock 응답을 반환하는 MSW 핸들러
 */

// MSW 라이브러리에서 HTTP 요청을 처리할 'http' 객체와 응답을 생성한 'HttpResponse' 객체를 불러온다.
import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { mockLobbyItems, mockLobbyPageResponse } from '../data/lobbies';

import type {
    LobbyCategory,
    LobbyListItem,
    LobbySortQuery,
} from '../../types/lobby';

const LOBBY_CATEGORIES = ['K-POP', 'J-POP', 'POP'] as const;
const LOBBY_SORT_QUERIES = [
    'latest',
    'most_players',
    'most_available',
] as const;

function isLobbyCategory(value: string | null): value is LobbyCategory {
    return LOBBY_CATEGORIES.some((category) => category === value);
}

function isLobbySortQuery(value: string | null): value is LobbySortQuery {
    return LOBBY_SORT_QUERIES.some((sortQuery) => sortQuery === value);
}

function parsePageParam(value: string | null, fallback: number) {
    const parsedValue = Number(value);

    return Number.isInteger(parsedValue) && parsedValue >= 0
        ? parsedValue
        : fallback;
}

function parseSizeParam(value: string | null, fallback: number) {
    const parsedValue = Number(value);

    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : fallback;
}

function getCreatedAt(lobby: LobbyListItem) {
    return lobby.createdAtEpochMillis ?? 0;
}

function filterLobbyItems(requestUrl: URL) {
    const keyword = requestUrl.searchParams.get('keyword')?.trim().toLowerCase();
    const mapCategory = requestUrl.searchParams.get('mapCategory');

    return mockLobbyItems.filter((lobby) => {
        const matchesKeyword =
            !keyword || lobby.title.toLowerCase().includes(keyword);
        const matchesCategory =
            !isLobbyCategory(mapCategory) ||
            lobby.mapCategory === mapCategory;

        return matchesKeyword && matchesCategory;
    });
}

function sortLobbyItems(
    lobbies: LobbyListItem[],
    sortQuery: LobbySortQuery | null,
) {
    const copiedLobbies = [...lobbies];

    switch (sortQuery) {
        case 'most_players':
            return copiedLobbies.sort(
                (left, right) => right.currentPlayers - left.currentPlayers,
            );

        case 'most_available':
            return copiedLobbies.sort((left, right) => {
                const rightAvailable = right.maxPlayers - right.currentPlayers;
                const leftAvailable = left.maxPlayers - left.currentPlayers;

                return rightAvailable - leftAvailable;
            });

        case 'latest':
        default:
            return copiedLobbies.sort(
                (left, right) => getCreatedAt(right) - getCreatedAt(left),
            );
    }
}

// worker.ts나 server.ts에서 등록할 수 있도록 핸들러들을 배열 형태로 내보낸다. (export)
export const lobbyHandlers = [
    // 클라이언트가 GET 메서드로 로비 목록 엔드포인트에 요청을 보낼 때 이를 가로챈다.
    http.get(API_ENDPOINTS.LOBBY.LIST, ({ request }) => {
        const requestUrl = new URL(request.url);
        const sortParam = requestUrl.searchParams.get('sort');
        const sortQuery = isLobbySortQuery(sortParam) ? sortParam : null;
        const page = parsePageParam(
            requestUrl.searchParams.get('page'),
            mockLobbyPageResponse.page,
        );
        const size = parseSizeParam(
            requestUrl.searchParams.get('size'),
            mockLobbyPageResponse.size,
        );
        const startIndex = page * size;
        const sortedLobbies = sortLobbyItems(
            filterLobbyItems(requestUrl),
            sortQuery,
        );
        const items = sortedLobbies.slice(startIndex, startIndex + size);

        return HttpResponse.json({
            items,
            page,
            size,
            hasNext: startIndex + size < sortedLobbies.length,
        });
    }),
];
