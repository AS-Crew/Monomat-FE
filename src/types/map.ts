import type { LobbyCategory } from './lobby';

export type MapCategory = LobbyCategory;

export type MapCategoryQueryValue =
    | 'KPOP'
    | 'JPOP'
    | 'POP'
    | 'OST'
    | 'ANIME';

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
    category?: MapCategory | MapCategoryQueryValue;
    sort?: MapSortOption;
}

export interface CreateMapRequest {
    title: string;
    description: string | null;
    category: MapCategory;
    isPublic: boolean;
}

export interface UpdateMapRequest {
    title: string;
    description: string | null;
    category: MapCategory;
    isPublic: boolean;
}

export interface ManageMapItemRequest {
    id: number | null;
    orderNum: number;
    youtubeUrl: string;
    startTime: number;
    answers: string[];
    hint: string;
    hintTime: number | null;
}

export interface ManageMapRequest extends UpdateMapRequest {
    items: ManageMapItemRequest[];
    deletedItemIds: number[];
}

export interface CreateMapItemRequest {
    orderNum: number;
    youtubeUrl: string;
    startTime: number;
    answers: string[];
    hint: string;
    hintTime?: number | null;
}

export type CreateMapWithItemsItemRequest = CreateMapItemRequest;

export interface CreateMapWithItemsRequest extends CreateMapRequest {
    items: CreateMapWithItemsItemRequest[];
}

export type UpdateMapItemRequest = CreateMapItemRequest;

export interface ReorderMapItemsRequest {
    itemIds: number[];
}

export interface MapDetailResponse {
    id: number;
    ownerId: number;
    ownerNickname: string | null;
    title: string;
    description: string | null;
    category: MapCategory;
    numOfSong: number;
    totalPlayTime: number;
    isPublic: boolean;
    pendingPublic: boolean;
    playCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface MapItemResponse {
    id: number;
    mapId: number;
    orderNum: number;
    youtubeUrl: string;
    videoId: string | null;
    startTime: number;
    title: string | null;
    artist: string | null;
    thumbnailUrl: string | null;
    answers: string[];
    hint: string;
    hintTime: number;
    createdAt: string;
    updatedAt: string;
}

export interface ManageMapResponse {
    map: MapDetailResponse;
    items: MapItemResponse[];
}

export interface CreateMapWithItemsResponse {
    map: MapDetailResponse;
    items: MapItemResponse[];
}

export interface CreateMapSongFormState {
    id: string;
    youtubeUrl: string;
    hint: string;
    startTime: string;
    videoDurationSeconds: number | null;
    answers: string[];
    hintTime?: number | null;
    playDurationSeconds?: number | null;
}

export interface ManageMapSongFormState extends CreateMapSongFormState {
    itemId: number | null;
}

export interface CreateMapFormState {
    title: string;
    description: string;
    category: MapCategory;
    isPublic: boolean;
    songs: CreateMapSongFormState[];
}
