import type { LobbyCategory } from './lobby';

export type MapCategory = LobbyCategory;

export type MapSortOption =
    | 'NEWEST'
    | 'OLDEST'
    | 'MOST_SONGS'
    | 'TITLE_ASC';

export interface MapSummary {
    mapId: number;
    title: string;
    description: string | null;
    category: MapCategory;
    numOfSong: number;
    totalPlayTime: number;
    playCount?: number;
    isPublic: boolean;
    pendingPublic: boolean;
    ownerId: number;
    ownerNickname: string | null;
}

export interface MapPageResponse {
    content: MapSummary[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export interface MapListQueryParams {
    page?: number;
    size?: number;
    keyword?: string;
    category?: MapCategory;
    sort?: MapSortOption;
}
