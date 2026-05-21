// 게임 로비 (대기방)와 관련된 타입을 정의한다.

export type LobbyCategory = 'K-POP' | 'J-POP' | 'POP' | 'OST';

export type LobbyStatus = 'WAITING' | 'PLAYING' | (string & {});

export type LobbySortOption =
    | 'LATEST'
    | 'MOST_PLAYERS'
    | 'MOST_EMPTY_SLOTS';

export const SORT_QUERY_MAP = {
    LATEST: 'latest',
    MOST_PLAYERS: 'most_players',
    MOST_EMPTY_SLOTS: 'most_available',
} as const satisfies Record<LobbySortOption, string>;

export type LobbySortQuery = (typeof SORT_QUERY_MAP)[LobbySortOption];

export interface LobbyPageResponse<T> {
    items: T[];
    page: number;
    size: number;
    hasNext: boolean;
}

export interface LobbyListItem {
    code: string;
    hostId: string;
    title: string;
    mapId: number | null;
    mapTitle: string | null;
    mapCategory: LobbyCategory | null;
    maxPlayers: number;
    currentPlayers: number;
    isPrivate: boolean;
    status: LobbyStatus;
    createdAtEpochMillis: number | null;
}

export type Lobby = LobbyListItem;

export interface LobbyListQueryParams {
    keyword?: string;
    mapCategory?: LobbyCategory;
    sort?: LobbySortQuery;
    page?: number;
    size?: number;
}

export interface JoinLobbyRequest {
    inviteCode: string;
}

export interface JoinLobbyResponse {
    inviteCode: string;
    title: string;
    hostId: string;
    maxPlayers: number;
    currentPlayers: number;
    status: 'WAITING' | 'PLAYING';
    mapId: number | null;
    mapTitle: string | null;
    mapCategory: LobbyCategory | null;
}
