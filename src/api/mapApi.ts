import { API_ENDPOINTS } from '../constants/endpoints';
import {
    manageMapResponseSchema,
    mapDetailResponseSchema,
    mapItemListResponseSchema,
    mapItemResponseSchema,
    mapPageResponseSchema,
} from '../schemas/mapSchema';
import { createApiError } from './apiError';
import { fetchWithAuth } from './apiClient';

import type {
    CreateMapItemRequest,
    CreateMapRequest,
    ManageMapRequest,
    ManageMapResponse,
    MapDetailResponse,
    MapItemResponse,
    MapListQueryParams,
    MapPageResponse,
    ReorderMapItemsRequest,
    UpdateMapRequest,
    UpdateMapItemRequest,
} from '../types/map';

const JSON_CONTENT_TYPE = 'application/json';
const DEFAULT_FETCH_PUBLIC_MAP_LIST_ERROR_MESSAGE =
    '맵 목록을 불러오는 데 실패했습니다.';
const DEFAULT_FETCH_MY_MAP_LIST_ERROR_MESSAGE =
    '내 맵 목록을 불러오는 데 실패했습니다.';
const DEFAULT_FETCH_MY_MAP_DETAIL_ERROR_MESSAGE =
    '맵 정보를 불러오는 데 실패했습니다.';
const DEFAULT_FETCH_MAP_ITEMS_ERROR_MESSAGE =
    '곡 목록을 불러오는 데 실패했습니다.';
const DEFAULT_CREATE_MAP_ERROR_MESSAGE = '맵 생성에 실패했습니다.';
const DEFAULT_CREATE_MAP_ITEM_ERROR_MESSAGE = '곡 등록에 실패했습니다.';
const DEFAULT_UPDATE_MAP_ERROR_MESSAGE = '맵 수정에 실패했습니다.';
const DEFAULT_UPDATE_MANAGED_MAP_ERROR_MESSAGE =
    '맵 정보를 수정하지 못했습니다.';
const DEFAULT_UPDATE_MAP_ITEM_ERROR_MESSAGE = '곡 수정에 실패했습니다.';
const DEFAULT_DELETE_MAP_ITEM_ERROR_MESSAGE = '곡 삭제에 실패했습니다.';
const DEFAULT_REORDER_MAP_ITEMS_ERROR_MESSAGE =
    '곡 순서 변경에 실패했습니다.';
const DEFAULT_DELETE_MAP_ERROR_MESSAGE =
    '맵 삭제에 실패했습니다.';

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

function createMapListUrl(
    endpoint: string,
    params: MapListQueryParams = {},
) {
    const searchParams = new URLSearchParams();

    appendNumberParam(searchParams, 'page', params.page);
    appendNumberParam(searchParams, 'size', params.size);
    appendNonEmptyParam(searchParams, 'keyword', params.keyword);
    appendNonEmptyParam(searchParams, 'category', params.category);
    appendNonEmptyParam(searchParams, 'sort', params.sort);

    const queryString = searchParams.toString();

    return queryString ? `${endpoint}?${queryString}` : endpoint;
}

async function fetchMapPage(
    url: string,
    fallbackMessage: string,
): Promise<MapPageResponse> {
    const response = await fetchWithAuth(url);

    if (!response.ok) {
        throw await createApiError(response, fallbackMessage);
    }

    const payload = await response.json() as unknown;
    const parsed = mapPageResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 맵 목록 응답 검증 실패:', parsed.error);

        throw new Error('맵 목록 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function getPublicMaps(
    params?: MapListQueryParams,
): Promise<MapPageResponse> {
    return fetchMapPage(
        createMapListUrl(API_ENDPOINTS.MAP.LIST, params),
        DEFAULT_FETCH_PUBLIC_MAP_LIST_ERROR_MESSAGE,
    );
}

export async function getMyMaps(
    params?: Pick<MapListQueryParams, 'page' | 'size'>,
): Promise<MapPageResponse> {
    return fetchMapPage(
        createMapListUrl(API_ENDPOINTS.MAP.MY_LIST, params),
        DEFAULT_FETCH_MY_MAP_LIST_ERROR_MESSAGE,
    );
}

export async function getMyMapDetail(
    mapId: number,
): Promise<MapDetailResponse> {
    const response = await fetchWithAuth(
        API_ENDPOINTS.MAP.MY_DETAIL(mapId),
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_FETCH_MY_MAP_DETAIL_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = mapDetailResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 내 맵 상세 응답 검증 실패:', parsed.error);

        throw new Error('맵 상세 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function getMapItems(
    mapId: number,
): Promise<MapItemResponse[]> {
    const response = await fetchWithAuth(API_ENDPOINTS.MAP.ITEMS(mapId));

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_FETCH_MAP_ITEMS_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = mapItemListResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 곡 목록 응답 검증 실패:', parsed.error);

        throw new Error('곡 목록 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function createMap(
    request: CreateMapRequest,
): Promise<MapDetailResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.MAP.CREATE, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(response, DEFAULT_CREATE_MAP_ERROR_MESSAGE);
    }

    const payload = await response.json() as unknown;
    const parsed = mapDetailResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 맵 생성 응답 검증 실패:', parsed.error);

        throw new Error('맵 생성 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function updateMap(
    mapId: number,
    request: UpdateMapRequest,
): Promise<MapDetailResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.MAP.UPDATE(mapId), {
        method: 'PUT',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(response, DEFAULT_UPDATE_MAP_ERROR_MESSAGE);
    }

    const payload = await response.json() as unknown;
    const parsed = mapDetailResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 맵 수정 응답 검증 실패:', parsed.error);

        throw new Error('맵 수정 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function updateManagedMap(
    mapId: number,
    request: ManageMapRequest,
): Promise<ManageMapResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.MAP.MANAGE(mapId), {
        method: 'PUT',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_UPDATE_MANAGED_MAP_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = manageMapResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 맵 관리 저장 응답 검증 실패:', parsed.error);

        throw new Error('맵 관리 저장 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function createMapItem(
    mapId: number,
    request: CreateMapItemRequest,
): Promise<MapItemResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.MAP.ITEMS(mapId), {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_CREATE_MAP_ITEM_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = mapItemResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 곡 생성 응답 검증 실패:', parsed.error);

        throw new Error('곡 생성 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function updateMapItem(
    mapId: number,
    itemId: number,
    request: UpdateMapItemRequest,
): Promise<MapItemResponse> {
    const response = await fetchWithAuth(
        API_ENDPOINTS.MAP.ITEM(mapId, itemId),
        {
            method: 'PUT',
            headers: {
                'Content-Type': JSON_CONTENT_TYPE,
            },
            body: JSON.stringify(request),
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_UPDATE_MAP_ITEM_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = mapItemResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error('[mapApi] 곡 수정 응답 검증 실패:', parsed.error);

        throw new Error('곡 수정 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}

export async function deleteMapItem(
    mapId: number,
    itemId: number,
): Promise<void> {
    const response = await fetchWithAuth(
        API_ENDPOINTS.MAP.ITEM(mapId, itemId),
        {
            method: 'DELETE',
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_DELETE_MAP_ITEM_ERROR_MESSAGE,
        );
    }
}

export async function reorderMapItems(
    mapId: number,
    request: ReorderMapItemsRequest,
): Promise<void> {
    const response = await fetchWithAuth(
        API_ENDPOINTS.MAP.ITEM_ORDER(mapId),
        {
            method: 'PUT',
            headers: {
                'Content-Type': JSON_CONTENT_TYPE,
            },
            body: JSON.stringify(request),
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_REORDER_MAP_ITEMS_ERROR_MESSAGE,
        );
    }
}

export async function deleteMap(mapId: number): Promise<void> {
    const response = await fetchWithAuth(API_ENDPOINTS.MAP.DELETE(mapId), {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw await createApiError(response, DEFAULT_DELETE_MAP_ERROR_MESSAGE);
    }
}
