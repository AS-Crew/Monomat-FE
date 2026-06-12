/**
 * 로비 목록 조회 요청을 가로채서 Mock 응답을 반환하는 MSW 핸들러
 */

// MSW 라이브러리에서 HTTP 요청을 처리할 'http' 객체와 응답을 생성한 'HttpResponse' 객체를 불러온다.
import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { CREATE_LOBBY_POLICY } from '../../constants/lobby';
import { updateLobbySettingsRequestSchema } from '../../schemas/lobbySchema';
import { mockLobbyItems, mockLobbyPageResponse } from '../data/lobbies';
import { mockMapItems } from '../data/maps';

import type {
    CreateLobbyRequest,
    LobbyCategory,
    LobbyDetailResponse,
    LobbyListItem,
    LobbyPlayerResponse,
    LobbySortQuery,
    UpdateLobbySettingsRequest,
} from '../../types/lobby';
import type { LobbyChatMessage } from '../../types/lobbyChat';

const LOBBY_CATEGORIES = ['K-POP', 'J-POP', 'POP', 'OST', '애니'] as const;
const LOBBY_SORT_QUERIES = [
    'latest',
    'most_players',
    'most_available',
] as const;

let latestCreatedLobby: LobbyDetailResponse | null = null;
const MOCK_PARTICIPANT_USER_IDENTIFIER =
    '22222222-2222-4222-8222-222222222222';
const mockLobbyDetailOverrides = new Map<
    string,
    Partial<Pick<
        LobbyDetailResponse,
        | 'mapId'
        | 'mapTitle'
        | 'mapCategory'
        | 'maxPlayers'
        | 'questionCount'
        | 'timeLimitSeconds'
    >>
>();
const mockLobbyReadyOverrides = new Map<string, Map<string, boolean>>();

function createMockRecentLobbyChats(code: string): LobbyChatMessage[] {
    return [
        {
            messageId: `${code}-chat-1`,
            type: 'CHAT',
            roomId: code,
            sender: 'mock-player-songking',
            senderId: 5,
            senderNickname: '노래왕',
            content: 'K-POP 방 같이 하실 분~',
            timestamp: '2026-06-12T11:43:00.000Z',
            sentAt: '2026-06-12T11:43:00.000Z',
        },
        {
            type: 'READY_CHANGED',
            roomId: code,
            sender: MOCK_PARTICIPANT_USER_IDENTIFIER,
            content: `${MOCK_PARTICIPANT_USER_IDENTIFIER}님이 준비 완료 상태로 변경했습니다.`,
            timestamp: '2026-06-12T11:44:00.000Z',
        },
        {
            messageId: `${code}-chat-2`,
            type: 'CHAT',
            roomId: code,
            sender: 'mock-player-night',
            senderId: 6,
            senderNickname: '심야괴담회',
            content:
                '시간은 24시간 표기법으로 표시되고, 긴 메시지는 채팅 영역 안에서 자연스럽게 줄바꿈됩니다.',
            timestamp: '2026-06-12T11:45:00.000Z',
            sentAt: '2026-06-12T11:45:00.000Z',
        },
    ];
}

const MOCK_PLAYER_POOL = [
    {
        userIdentifier: MOCK_PARTICIPANT_USER_IDENTIFIER,
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

function selectMockPlayerPool(lobby: LobbyListItem) {
    if (lobby.code === 'OST321') {
        return MOCK_PLAYER_POOL.filter((player) => player.ready);
    }

    return MOCK_PLAYER_POOL;
}

function canStartMockLobby(lobby: {
    status: LobbyListItem['status'];
    mapId: number | null;
    mapTitle: string | null;
    players: LobbyPlayerResponse[];
}) {
    const nonHostPlayers = lobby.players.filter((player) => !player.host);
    const hasSelectedMap =
        lobby.mapId != null && Boolean(lobby.mapTitle?.trim());

    return (
        lobby.status === 'WAITING' &&
        hasSelectedMap &&
        nonHostPlayers.length > 0 &&
        nonHostPlayers.every((player) => player.ready)
    );
}

function createLobbyDetailFromItem(
    lobby: LobbyListItem,
): LobbyDetailResponse {
    const override = mockLobbyDetailOverrides.get(lobby.code);
    const hostPlayer: LobbyPlayerResponse = {
        userIdentifier: lobby.hostId ?? 'mock-host',
        nickname: lobby.hostNickname ?? 'Mock Host',
        host: true,
        ready: true,
    };
    const readyOverrides = mockLobbyReadyOverrides.get(lobby.code);
    const players: LobbyPlayerResponse[] = [
        hostPlayer,
        ...selectMockPlayerPool(lobby)
            .slice(0, Math.max(lobby.currentPlayers - 1, 0))
            .map((player): LobbyPlayerResponse => ({
                userIdentifier: player.userIdentifier,
                nickname: player.nickname,
                host: false,
                ready:
                    readyOverrides?.get(player.userIdentifier) ??
                    player.ready,
            })),
    ];

    return {
        inviteCode: lobby.code,
        title: lobby.title,
        hostId: lobby.hostId ?? 'mock-host',
        hostNickname: lobby.hostNickname ?? 'Mock Host',
        maxPlayers: override?.maxPlayers ?? lobby.maxPlayers,
        currentPlayers: lobby.currentPlayers,
        status: lobby.status,
        mapId: override?.mapId ?? lobby.mapId,
        mapTitle: override?.mapTitle ?? lobby.mapTitle,
        mapCategory: override?.mapCategory ?? lobby.mapCategory,
        questionCount:
            override?.questionCount ??
            lobby.questionCount ?? CREATE_LOBBY_POLICY.DEFAULT_QUESTION_COUNT,
        timeLimitSeconds:
            override?.timeLimitSeconds ??
            lobby.timeLimitSeconds ??
            CREATE_LOBBY_POLICY.DEFAULT_TIME_LIMIT_SECONDS,
        players,
        canStart: canStartMockLobby({
            status: lobby.status,
            mapId: override?.mapId ?? lobby.mapId,
            mapTitle: override?.mapTitle ?? lobby.mapTitle,
            players,
        }),
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
            canStart: canStartMockLobby({
                status: 'WAITING',
                mapId: selectedMap?.mapId ?? null,
                mapTitle: selectedMap?.title ?? null,
                players: [
                    {
                        userIdentifier: 'mock-host',
                        nickname: 'Mock Host',
                        host: true,
                        ready: true,
                    },
                ],
            }),
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

    http.get(API_ENDPOINTS.LOBBY.RECENT_CHATS(':code'), ({ params }) => {
        const code = typeof params.code === 'string' ? params.code : '';
        const lobbyExists =
            latestCreatedLobby?.inviteCode === code ||
            mockLobbyItems.some((item) => item.code === code);

        if (!lobbyExists) {
            return HttpResponse.json(
                {
                    message: '로비를 찾을 수 없습니다.',
                },
                { status: 404 },
            );
        }

        return HttpResponse.json(createMockRecentLobbyChats(code));
    }),

    http.patch(
        API_ENDPOINTS.LOBBY.READY(':code'),
        async ({ params, request }) => {
            const code = typeof params.code === 'string' ? params.code : '';
            let payload: unknown;

            try {
                payload = await request.json();
            } catch {
                return HttpResponse.json(
                    { message: '요청 본문 형식이 올바르지 않습니다.' },
                    { status: 400 },
                );
            }

            if (
                !payload ||
                typeof payload !== 'object' ||
                Array.isArray(payload) ||
                typeof (payload as { ready?: unknown }).ready !== 'boolean'
            ) {
                return HttpResponse.json(
                    { message: '준비 상태는 필수입니다.' },
                    { status: 400 },
                );
            }

            const ready = (payload as { ready: boolean }).ready;

            if (latestCreatedLobby?.inviteCode === code) {
                if (latestCreatedLobby.status !== 'WAITING') {
                    return HttpResponse.json(
                        {
                            message:
                                '게임이 이미 시작된 로비에는 입장할 수 없습니다.',
                        },
                        { status: 409 },
                    );
                }

                const participant = latestCreatedLobby.players.find(
                    (player) => !player.host,
                );

                if (!participant) {
                    return HttpResponse.json(
                        {
                            message:
                                '로비 참여자만 준비 상태를 변경할 수 있습니다.',
                        },
                        { status: 403 },
                    );
                }

                const players = latestCreatedLobby.players.map((player) =>
                    player.userIdentifier === participant.userIdentifier
                        ? { ...player, ready }
                        : player,
                );

                latestCreatedLobby = {
                    ...latestCreatedLobby,
                    players,
                    canStart: canStartMockLobby({
                        status: latestCreatedLobby.status,
                        mapId: latestCreatedLobby.mapId,
                        mapTitle: latestCreatedLobby.mapTitle,
                        players,
                    }),
                };

                return new HttpResponse(null, { status: 204 });
            }

            const lobby = mockLobbyItems.find((item) => item.code === code);

            if (!lobby) {
                return HttpResponse.json(
                    { message: '로비를 찾을 수 없습니다.' },
                    { status: 404 },
                );
            }

            if (lobby.status !== 'WAITING') {
                return HttpResponse.json(
                    {
                        message:
                            '게임이 이미 시작된 로비에는 입장할 수 없습니다.',
                    },
                    { status: 409 },
                );
            }

            const lobbyDetail = createLobbyDetailFromItem(lobby);
            const participant = lobbyDetail.players.find(
                (player) =>
                    player.userIdentifier ===
                    MOCK_PARTICIPANT_USER_IDENTIFIER,
            );

            if (!participant) {
                return HttpResponse.json(
                    {
                        message:
                            '로비 참여자만 준비 상태를 변경할 수 있습니다.',
                    },
                    { status: 403 },
                );
            }

            const readyOverrides =
                mockLobbyReadyOverrides.get(code) ?? new Map<string, boolean>();
            readyOverrides.set(participant.userIdentifier, ready);
            mockLobbyReadyOverrides.set(code, readyOverrides);

            return new HttpResponse(null, { status: 204 });
        },
    ),

    http.patch(API_ENDPOINTS.LOBBY.MAP(':code'), async ({ params, request }) => {
        const code = typeof params.code === 'string' ? params.code : '';
        const payload = (await request.json()) as { mapId?: unknown };
        const mapId = typeof payload.mapId === 'number' ? payload.mapId : null;
        const selectedMap = mapId == null
            ? null
            : mockMapItems.find((map) => map.mapId === mapId) ?? null;

        if (!selectedMap) {
            return HttpResponse.json(
                { message: '맵을 찾을 수 없습니다.' },
                { status: 404 },
            );
        }

        if (latestCreatedLobby?.inviteCode === code) {
            const nextLobby: LobbyDetailResponse = {
                ...latestCreatedLobby,
                mapId: selectedMap.mapId,
                mapTitle: selectedMap.title,
                mapCategory: selectedMap.category,
                questionCount: selectedMap.numOfSong,
            };

            latestCreatedLobby = {
                ...nextLobby,
                canStart: canStartMockLobby({
                    status: nextLobby.status,
                    mapId: nextLobby.mapId,
                    mapTitle: nextLobby.mapTitle,
                    players: nextLobby.players,
                }),
            };

            return new HttpResponse(null, { status: 204 });
        }

        const lobby = mockLobbyItems.find((item) => item.code === code);

        if (!lobby) {
            return HttpResponse.json(
                { message: '로비를 찾을 수 없습니다.' },
                { status: 404 },
            );
        }

        if (lobby.status !== 'WAITING') {
            return HttpResponse.json(
                { message: '대기 중인 로비에서만 맵을 변경할 수 있습니다.' },
                { status: 409 },
            );
        }

        mockLobbyDetailOverrides.set(code, {
            ...mockLobbyDetailOverrides.get(code),
            mapId: selectedMap.mapId,
            mapTitle: selectedMap.title,
            mapCategory: selectedMap.category,
            questionCount: selectedMap.numOfSong,
        });

        return new HttpResponse(null, { status: 204 });
    }),

    http.patch(
        API_ENDPOINTS.LOBBY.SETTINGS(':code'),
        async ({ params, request }) => {
            const code = typeof params.code === 'string' ? params.code : '';
            let payload: unknown;

            try {
                payload = await request.json();
            } catch {
                return HttpResponse.json(
                    { message: '요청 본문 형식이 올바르지 않습니다.' },
                    { status: 400 },
                );
            }

            const parsed = updateLobbySettingsRequestSchema.safeParse(payload);

            if (!parsed.success) {
                return HttpResponse.json(
                    { message: '로비 설정값의 허용 범위를 확인해주세요.' },
                    { status: 400 },
                );
            }

            const settings: UpdateLobbySettingsRequest = parsed.data;

            if (latestCreatedLobby?.inviteCode === code) {
                if (latestCreatedLobby.status !== 'WAITING') {
                    return HttpResponse.json(
                        {
                            message:
                                '게임이 이미 시작된 로비에서는 설정을 변경할 수 없습니다.',
                        },
                        { status: 409 },
                    );
                }

                if (settings.maxPlayers < latestCreatedLobby.currentPlayers) {
                    return HttpResponse.json(
                        {
                            message:
                                '최대 인원은 현재 참가자 수보다 작을 수 없습니다.',
                        },
                        { status: 409 },
                    );
                }

                const selectedMap = latestCreatedLobby.mapId == null
                    ? null
                    : mockMapItems.find(
                        (map) => map.mapId === latestCreatedLobby?.mapId,
                    ) ?? null;

                if (
                    selectedMap &&
                    settings.questionCount > selectedMap.numOfSong
                ) {
                    return HttpResponse.json(
                        {
                            message:
                                '문제 수는 선택된 맵의 등록 곡 수를 초과할 수 없습니다.',
                        },
                        { status: 409 },
                    );
                }

                latestCreatedLobby = {
                    ...latestCreatedLobby,
                    ...settings,
                };

                return new HttpResponse(null, { status: 204 });
            }

            const lobby = mockLobbyItems.find((item) => item.code === code);

            if (!lobby) {
                return HttpResponse.json(
                    { message: '로비를 찾을 수 없습니다.' },
                    { status: 404 },
                );
            }

            if (lobby.status !== 'WAITING') {
                return HttpResponse.json(
                    {
                        message:
                            '게임이 이미 시작된 로비에서는 설정을 변경할 수 없습니다.',
                    },
                    { status: 409 },
                );
            }

            if (settings.maxPlayers < lobby.currentPlayers) {
                return HttpResponse.json(
                    {
                        message:
                            '최대 인원은 현재 참가자 수보다 작을 수 없습니다.',
                    },
                    { status: 409 },
                );
            }

            const override = mockLobbyDetailOverrides.get(code);
            const selectedMapId = override?.mapId ?? lobby.mapId;
            const selectedMap = selectedMapId == null
                ? null
                : mockMapItems.find((map) => map.mapId === selectedMapId) ??
                    null;

            if (
                selectedMap &&
                settings.questionCount > selectedMap.numOfSong
            ) {
                return HttpResponse.json(
                    {
                        message:
                            '문제 수는 선택된 맵의 등록 곡 수를 초과할 수 없습니다.',
                    },
                    { status: 409 },
                );
            }

            mockLobbyDetailOverrides.set(code, {
                ...override,
                ...settings,
            });

            return new HttpResponse(null, { status: 204 });
        },
    ),

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
        const totalElements = sortedLobbies.length;
        const totalPages = Math.ceil(totalElements / size);

        return HttpResponse.json({
            items,
            page,
            size,
            totalElements,
            totalPages,
            hasNext: startIndex + size < totalElements,
        });
    }),
];
