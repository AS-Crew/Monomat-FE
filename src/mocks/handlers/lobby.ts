/**
 * 로비 목록 조회 요청을 가로채서 Mock 응답을 반환하는 MSW 핸들러
 */

// MSW 라이브러리에서 HTTP 요청을 처리할 'http' 객체와 응답을 생성한 'HttpResponse' 객체를 불러온다.
import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { CREATE_LOBBY_POLICY } from '../../constants/lobby';
import { mockLobbyItems, mockLobbyPageResponse } from '../data/lobbies';
import { mockMapItems } from '../data/maps';

import type {
    CreateLobbyRequest,
    LobbyCategory,
    LobbyDetailResponse,
    LobbyListItem,
    LobbyPlayerResponse,
    LobbySortQuery,
} from '../../types/lobby';

const LOBBY_CATEGORIES = ['K-POP', 'J-POP', 'POP', 'OST', '애니'] as const;
const LOBBY_SORT_QUERIES = [
    'latest',
    'most_players',
    'most_available',
] as const;

let latestCreatedLobby: LobbyDetailResponse | null = null;

const MOCK_PLAYER_POOL = [
    {
        userIdentifier: 'mock-player-yuki',
        nickname: '유키',
        ready: false,
    },
    {
        userIdentifier: 'mock-player-bell',
        nickname: '벨',
        ready: true,
    },
    {
        userIdentifier: 'mock-player-nut',
        nickname: 'Nut',
        ready: false,
    },
    {
        userIdentifier: 'mock-player-minji',
        nickname: '민지',
        ready: true,
    },
    {
        userIdentifier: 'mock-player-songking',
        nickname: '노래왕',
        ready: true,
    },
    {
        userIdentifier: 'mock-player-night',
        nickname: '심야괴담회',
        ready: false,
    },
    {
        userIdentifier: 'mock-player-pop',
        nickname: 'PopCat',
        ready: true,
    },
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

function createLobbyDetailFromItem(
    lobby: LobbyListItem,
): LobbyDetailResponse {
    const hostPlayer: LobbyPlayerResponse = {
        userIdentifier: lobby.hostId ?? 'mock-host',
        nickname: lobby.hostNickname ?? 'Mock Host',
        host: true,
        ready: true,
    };
    const players: LobbyPlayerResponse[] = [
        hostPlayer,
        ...MOCK_PLAYER_POOL.slice(0, Math.max(lobby.currentPlayers - 1, 0)).map(
            (player): LobbyPlayerResponse => ({
                userIdentifier: player.userIdentifier,
                nickname: player.nickname,
                host: false,
                ready: player.ready,
            }),
        ),
    ];

    return {
        inviteCode: lobby.code,
        title: lobby.title,
        hostId: lobby.hostId ?? 'mock-host',
        hostNickname: lobby.hostNickname ?? 'Mock Host',
        maxPlayers: lobby.maxPlayers,
        currentPlayers: lobby.currentPlayers,
        status: lobby.status,
        mapId: lobby.mapId,
        mapTitle: lobby.mapTitle,
        mapCategory: lobby.mapCategory,
        questionCount:
            lobby.questionCount ?? CREATE_LOBBY_POLICY.DEFAULT_QUESTION_COUNT,
        timeLimitSeconds:
            lobby.timeLimitSeconds ??
            CREATE_LOBBY_POLICY.DEFAULT_TIME_LIMIT_SECONDS,
        players,
        canStart:
            lobby.status === 'WAITING' &&
            players.length > 1 &&
            players.every((player) => player.host || player.ready),
    };
}

// worker.ts나 server.ts에서 등록할 수 있도록 핸들러들을 배열 형태로 내보낸다. (export)
export const lobbyHandlers = [
    http.post(API_ENDPOINTS.LOBBY.CREATE, async ({ request }) => {
        const payload = (await request.json()) as Partial<CreateLobbyRequest>;
        const title = typeof payload.title === 'string'
            ? payload.title
            : '새 로비';
        const maxPlayers = typeof payload.maxPlayers === 'number'
            ? payload.maxPlayers
            : CREATE_LOBBY_POLICY.DEFAULT_MAX_PLAYERS;
        const isPrivate = Boolean(payload.isPrivate);
        const questionCount = typeof payload.questionCount === 'number'
            ? payload.questionCount
            : CREATE_LOBBY_POLICY.DEFAULT_QUESTION_COUNT;
        const timeLimitSeconds = typeof payload.timeLimitSeconds === 'number'
            ? payload.timeLimitSeconds
            : CREATE_LOBBY_POLICY.DEFAULT_TIME_LIMIT_SECONDS;
        const selectedMap = typeof payload.mapId === 'number'
            ? mockMapItems.find((map) => map.mapId === payload.mapId) ?? null
            : null;
        const inviteCode = 'NEW123';

        latestCreatedLobby = {
            inviteCode,
            title,
            hostId: 'mock-host',
            hostNickname: 'Mock Host',
            maxPlayers,
            currentPlayers: 1,
            status: 'WAITING',
            mapId: selectedMap?.mapId ?? null,
            mapTitle: selectedMap?.title ?? null,
            mapCategory: selectedMap?.category ?? null,
            questionCount,
            timeLimitSeconds,
            players: [
                {
                    userIdentifier: 'mock-host',
                    nickname: 'Mock Host',
                    host: true,
                    ready: true,
                },
            ],
            canStart: false,
        };

        return HttpResponse.json(
            {
                lobbyId: Date.now(),
                inviteCode,
                title,
                maxPlayers,
                isPrivate,
                status: 'WAITING',
                mapId: selectedMap?.mapId ?? null,
                mapTitle: selectedMap?.title ?? null,
                mapCategory: selectedMap?.category ?? null,
            },
            { status: 201 },
        );
    }),

    http.get(API_ENDPOINTS.LOBBY.DETAIL(':code'), ({ params }) => {
        const code = typeof params.code === 'string' ? params.code : '';

        if (latestCreatedLobby?.inviteCode === code) {
            return HttpResponse.json(latestCreatedLobby);
        }

        const lobby = mockLobbyItems.find((item) => item.code === code);

        if (!lobby) {
            return HttpResponse.json(
                {
                    message: '로비를 찾을 수 없습니다.',
                },
                { status: 404 },
            );
        }

        return HttpResponse.json(createLobbyDetailFromItem(lobby));
    }),

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
