import { useQuery } from '@tanstack/react-query';

import { getMyMaps } from '../api/mapApi';
import {
    DEFAULT_MAP_LIST_PAGE,
    MY_MAP_LIST_PAGE_SIZE,
} from '../constants/map';

import type { MapPageResponse } from '../types/map';

interface UseMyMapsParams {
    page?: number;
    size?: number;
    enabled?: boolean;
}

export function useMyMaps(params: UseMyMapsParams = {}) {
    const normalizedParams = {
        page: params.page ?? DEFAULT_MAP_LIST_PAGE,
        size: params.size ?? MY_MAP_LIST_PAGE_SIZE,
    };

    return useQuery<MapPageResponse>({
        queryKey: [
            'myMaps',
            normalizedParams.page,
            normalizedParams.size,
        ],
        queryFn: () => getMyMaps(normalizedParams),
        enabled: params.enabled ?? true,
    });
}
