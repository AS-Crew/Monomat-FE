/**
 * Mock 데이터
 */

import type { LobbyListItem, LobbyPageResponse } from '../../types/lobby';

export const mockLobbyItems: LobbyListItem[] = [
    {
        code: 'ABC123',
        hostId: 'host-1',
        title: 'K-POP 퀴즈 대결 🔥',
        mapId: 1,
        mapTitle: 'K-POP 히트곡',
        mapCategory: 'K-POP',
        maxPlayers: 8,
        currentPlayers: 1,
        isPrivate: false,
        status: 'WAITING',
        createdAtEpochMillis: 1_714_000_000_000,
    },
    {
        code: 'JPO456',
        hostId: 'host-2',
        title: 'J-POP 애니송 모음',
        mapId: 2,
        mapTitle: 'J-POP 베스트',
        mapCategory: 'J-POP',
        maxPlayers: 6,
        currentPlayers: 4,
        isPrivate: false,
        status: 'WAITING',
        createdAtEpochMillis: 1_714_000_100_000,
    },
    {
        code: 'POP789',
        hostId: 'host-3',
        title: 'POP 명곡 맞히기',
        mapId: null,
        mapTitle: null,
        mapCategory: 'POP',
        maxPlayers: 5,
        currentPlayers: 5,
        isPrivate: true,
        status: 'PLAYING',
        createdAtEpochMillis: 1_714_000_200_000,
    },
];

export const mockLobbyPageResponse: LobbyPageResponse<LobbyListItem> = {
    items: mockLobbyItems,
    page: 0,
    size: 20,
    hasNext: false,
};
