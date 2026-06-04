import { API_ENDPOINTS } from '../constants/endpoints';
import { mapPageResponseSchema } from '../schemas/mapSchema';
import { createApiError } from './apiError';
import { fetchWithAuth } from './apiClient';

import type { MapListQueryParams, MapPageResponse } from '../types/map';

const DEFAULT_FETCH_PUBLIC_MAP_LIST_ERROR_MESSAGE =
    '맵 목록을 불러오는 데 실패했습니다.';
const DEFAULT_FETCH_MY_MAP_LIST_ERROR_MESSAGE =
    '내 맵 목록을 불러오는 데 실패했습니다.';

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
