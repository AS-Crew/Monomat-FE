import { http, HttpResponse } from 'msw';

import { API_ENDPOINTS } from '../../constants/endpoints';
import {
    DEFAULT_MAP_LIST_PAGE,
    DEFAULT_MAP_LIST_SIZE,
} from '../../constants/map';
import {
    mockMyMapItems,
    mockPublicMapItems,
} from '../data/maps';

import type {
    MapCategory,
    MapListQueryParams,
    MapSortOption,
    MapSummary,
} from '../../types/map';

const MAP_CATEGORIES = ['K-POP', 'J-POP', 'POP', 'OST', '애니'] as const;
const MAP_SORT_OPTIONS = [
    'NEWEST',
    'OLDEST',
    'MOST_SONGS',
    'TITLE_ASC',
] as const;

function isMapCategory(value: string | null): value is MapCategory {
    return MAP_CATEGORIES.some((category) => category === value);
}

function isMapSortOption(value: string | null): value is MapSortOption {
    return MAP_SORT_OPTIONS.some((sortOption) => sortOption === value);
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

function filterMapItems(
    maps: MapSummary[],
    requestUrl: URL,
    allowedPrivateMaps: boolean,
) {
    const keyword = requestUrl.searchParams.get('keyword')?.trim().toLowerCase();
    const category = requestUrl.searchParams.get('category');

    return maps.filter((map) => {
        const matchesVisibility = allowedPrivateMaps || map.isPublic;
        const matchesKeyword =
            !keyword ||
            map.title.toLowerCase().includes(keyword) ||
            map.category.toLowerCase().includes(keyword);
        const matchesCategory =
            !isMapCategory(category) || map.category === category;

        return matchesVisibility && matchesKeyword && matchesCategory;
    });
}

function sortMapItems(maps: MapSummary[], sortOption: MapSortOption | null) {
    const copiedMaps = [...maps];

    switch (sortOption) {
        case 'OLDEST':
            return copiedMaps.sort((left, right) => left.mapId - right.mapId);

        case 'MOST_SONGS':
            return copiedMaps.sort(
                (left, right) => right.numOfSong - left.numOfSong,
            );

        case 'TITLE_ASC':
            return copiedMaps.sort((left, right) =>
                left.title.localeCompare(right.title),
            );

        case 'NEWEST':
        default:
            return copiedMaps.sort((left, right) => right.mapId - left.mapId);
    }
}

function createMapPageResponse(
    maps: MapSummary[],
    page: number,
    size: number,
) {
    const startIndex = page * size;
    const content = maps.slice(startIndex, startIndex + size);
    const totalElements = maps.length;
    const totalPages = Math.ceil(totalElements / size);

    return {
        content,
        page,
        size,
        totalElements,
        totalPages,
        hasNext: startIndex + size < totalElements,
    };
}

function createMapListResponse(
    maps: MapSummary[],
    requestUrl: URL,
    allowedPrivateMaps: boolean,
    defaultParams: Pick<MapListQueryParams, 'page' | 'size'>,
) {
    const sortParam = requestUrl.searchParams.get('sort');
    const sortOption = isMapSortOption(sortParam) ? sortParam : null;
    const page = parsePageParam(
        requestUrl.searchParams.get('page'),
        defaultParams.page ?? DEFAULT_MAP_LIST_PAGE,
    );
    const size = parseSizeParam(
        requestUrl.searchParams.get('size'),
        defaultParams.size ?? DEFAULT_MAP_LIST_SIZE,
    );
    const filteredMaps = filterMapItems(
        maps,
        requestUrl,
        allowedPrivateMaps,
    );
    const sortedMaps = sortMapItems(filteredMaps, sortOption);

    return HttpResponse.json(createMapPageResponse(sortedMaps, page, size));
}

export const mapHandlers = [
    http.get(API_ENDPOINTS.MAP.LIST, ({ request }) => {
        return createMapListResponse(
            mockPublicMapItems,
            new URL(request.url),
            false,
            {
                page: DEFAULT_MAP_LIST_PAGE,
                size: DEFAULT_MAP_LIST_SIZE,
            },
        );
    }),

    http.get(API_ENDPOINTS.MAP.MY_LIST, ({ request }) => {
        const requestUrl = new URL(request.url);
        const page = parsePageParam(
            requestUrl.searchParams.get('page'),
            DEFAULT_MAP_LIST_PAGE,
        );
        const size = parseSizeParam(
            requestUrl.searchParams.get('size'),
            DEFAULT_MAP_LIST_SIZE,
        );

        return HttpResponse.json(
            createMapPageResponse(mockMyMapItems, page, size),
        );
    }),
];
