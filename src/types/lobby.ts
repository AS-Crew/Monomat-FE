// 게임 로비 (대기방)와 관련된 타입을 정의한다.
// DB의 GAME_LOBBY 테이블 구조를 기반으로 한다.

export type LobbyStatus = 'WAITING' | 'PLAYING' | 'RESULT';

export type LobbyCategory = 'K-POP' | 'J-POP' | 'POP' | 'OST';

export interface Lobby {
    code: string;
    hostId: string;
    title: string;
    mapId: number | null;
    mapCategory: LobbyCategory | null;
    maxPlayers: number;
    currentPlayers: number;
    isPrivate: boolean;
    status: 'WAITING' | 'PLAYING';
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