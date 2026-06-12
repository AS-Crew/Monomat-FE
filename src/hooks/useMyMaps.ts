import { useQuery } from '@tanstack/react-query';

import { getMyMaps } from '../api/mapApi';
import {
    DEFAULT_MAP_LIST_PAGE,
    DEFAULT_MAP_SORT_OPTION,
    MY_MAP_LIST_PAGE_SIZE,
} from '../constants/map';

import type {
    MapListQueryParams,
    MapPageResponse,
} from '../types/map';

interface UseMyMapsParams extends MapListQueryParams {
    enabled?: boolean;
}

export function useMyMaps(params: UseMyMapsParams = {}) {
    const normalizedParams = {
        keyword: params.keyword?.trim() || undefined,
        category: params.category,
        sort: params.sort ?? DEFAULT_MAP_SORT_OPTION,
        page: params.page ?? DEFAULT_MAP_LIST_PAGE,
        size: params.size ?? MY_MAP_LIST_PAGE_SIZE,
    };

    return useQuery<MapPageResponse>({
        queryKey: [
            'myMaps',
            normalizedParams.keyword,
            normalizedParams.category,
            normalizedParams.sort,
            normalizedParams.page,
            normalizedParams.size,
        ],
        queryFn: () => getMyMaps(normalizedParams),
        enabled: params.enabled ?? true,
    });
}
