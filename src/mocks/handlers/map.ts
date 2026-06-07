import { http, HttpResponse } from 'msw';

import { API_ENDPOINTS } from '../../constants/endpoints';
import {
    DEFAULT_MAP_LIST_PAGE,
    DEFAULT_MAP_LIST_SIZE,
    DEFAULT_MAP_SORT_OPTION,
    MAP_CATEGORY_OPTIONS,
    MAP_CATEGORY_QUERY_VALUE,
    MY_MAP_LIST_PAGE_SIZE,
} from '../../constants/map';
import {
    mockMyMapItems,
    mockPublicMapItems,
} from '../data/maps';

import type {
    CreateMapWithItemsRequest,
    MapCategory,
    MapCategoryQueryValue,
    MapListQueryParams,
    MapSortOption,
    MapSummary,
} from '../../types/map';

const MAP_SORT_OPTIONS = [
    'NEWEST',
    'OLDEST',
    'MOST_SONGS',
    'TITLE_ASC',
] as const;

function isMapCategory(value: string | null): value is MapCategory {
    return MAP_CATEGORY_OPTIONS.some((category) => category === value);
}

function isMapCategoryQueryValue(
    value: string | null,
): value is MapCategoryQueryValue {
    return Object.values(MAP_CATEGORY_QUERY_VALUE).some(
        (category) => category === value,
    );
}

function parseMapCategory(value: string | null): MapCategory | undefined {
    if (isMapCategory(value)) {
        return value;
    }

    if (!isMapCategoryQueryValue(value)) {
        return undefined;
    }

    return MAP_CATEGORY_OPTIONS.find(
        (category) => MAP_CATEGORY_QUERY_VALUE[category] === value,
    );
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
    const category = parseMapCategory(
        requestUrl.searchParams.get('category'),
    );

    return maps.filter((map) => {
        const matchesVisibility = allowedPrivateMaps || map.isPublic;
        const matchesKeyword =
            !keyword ||
            map.title.toLowerCase().includes(keyword) ||
            (allowedPrivateMaps &&
                map.category.toLowerCase().includes(keyword));
        const matchesCategory = !category || map.category === category;

        return matchesVisibility && matchesKeyword && matchesCategory;
    });
}

function sortMapItems(maps: MapSummary[], sortOption: MapSortOption) {
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
    const sortOption = isMapSortOption(sortParam)
        ? sortParam
        : DEFAULT_MAP_SORT_OPTION;
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
    http.post(
        API_ENDPOINTS.MAP.CREATE_WITH_ITEMS,
        async ({ request }) => {
            const payload =
                await request.json() as CreateMapWithItemsRequest;
            const nextMapId =
                Math.max(
                    0,
                    ...mockPublicMapItems.map((map) => map.mapId),
                    ...mockMyMapItems.map((map) => map.mapId),
                ) + 1;
            const createdAt = new Date().toISOString();
            const totalPlayTime = payload.items.reduce(
                (total, item) =>
                    total + (item.endTime - item.startTime),
                0,
            );
            const createdMap = {
                id: nextMapId,
                ownerId: 999,
                ownerNickname: '내계정',
                title: payload.title,
                description: payload.description,
                category: payload.category,
                numOfSong: payload.items.length,
                totalPlayTime,
                isPublic: payload.isPublic,
                pendingPublic: false,
                playCount: 0,
                createdAt,
                updatedAt: createdAt,
            };
            const createdItems = payload.items.map((item, index) => ({
                id: nextMapId * 1_000 + index + 1,
                mapId: nextMapId,
                orderNum: item.orderNum,
                youtubeUrl: item.youtubeUrl,
                videoId: null,
                startTime: item.startTime,
                endTime: item.endTime,
                title: null,
                artist: null,
                thumbnailUrl: null,
                answers: item.answers,
                hint: item.hint,
                hintTime: item.hintTime ?? 15,
                createdAt,
                updatedAt: createdAt,
            }));
            const mapSummary: MapSummary = {
                mapId: createdMap.id,
                title: createdMap.title,
                description: createdMap.description,
                category: createdMap.category,
                numOfSong: createdMap.numOfSong,
                totalPlayTime: createdMap.totalPlayTime,
                playCount: createdMap.playCount,
                isPublic: createdMap.isPublic,
                pendingPublic: createdMap.pendingPublic,
                ownerId: createdMap.ownerId,
                ownerNickname: createdMap.ownerNickname,
            };

            mockMyMapItems.unshift(mapSummary);

            if (mapSummary.isPublic) {
                mockPublicMapItems.unshift(mapSummary);
            }

            return HttpResponse.json(
                {
                    map: createdMap,
                    items: createdItems,
                },
                { status: 201 },
            );
        },
    ),

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
        return createMapListResponse(
            mockMyMapItems,
            new URL(request.url),
            true,
            {
                page: DEFAULT_MAP_LIST_PAGE,
                size: MY_MAP_LIST_PAGE_SIZE,
            },
        );
    }),
];
