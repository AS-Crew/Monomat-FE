import { useState } from 'react';
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import {
    createMapItem,
    deleteMapItem,
    deleteMap,
    getMapItems,
    getMyMapDetail,
    reorderMapItems,
    updateMap,
    updateMapItem,
} from '../api/mapApi';
import { NavigationBar } from '../components/common/NavigationBar';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { MapDeleteConfirmModal } from '../components/map/MapDeleteConfirmModal';
import { MapItemDetailModal } from '../components/map/MapItemDetailModal';
import { MapManageSongList } from '../components/map/MapManageSongList';
import { MapManageSongEditor } from '../components/map/MapManageSongEditor';
import { MapManageSummary } from '../components/map/MapManageSummary';
import {
    MAP_CREATE_POLICY,
    MAP_DELETE_CONFIRM_MODAL_COPY,
    MAP_MANAGE_PAGE_COPY,
    MAP_ROUTES,
} from '../constants/map';
import {
    LOBBY_QUERY_PARAMS,
    LOBBY_ROUTES,
} from '../constants/lobby';

import type {
    CreateMapItemRequest,
    MapDetailResponse,
    MapItemResponse,
    ManageMapSongFormState,
    UpdateMapRequest,
} from '../types/map';
import { generateUUID } from '../utils/uuid';
import {
    createMapItemRequestFromSong,
    isValidMapSongForm,
} from '../utils/mapSongForm';

function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

interface SaveMapManageChanges {
    mapRequest: UpdateMapRequest;
    songs: ManageMapSongFormState[];
}

function createManageSongForm(
    item: MapItemResponse,
): ManageMapSongFormState {
    return {
        id: `map-item-${item.id}`,
        itemId: item.id,
        youtubeUrl: item.youtubeUrl,
        hint: item.hint,
        startTime: String(item.startTime),
        videoDurationSeconds: null,
        answers: [...item.answers],
        hintTime: item.hintTime,
        playDurationSeconds: Math.max(1, item.endTime - item.startTime),
    };
}

function createEmptyManageSong(): ManageMapSongFormState {
    return {
        id: generateUUID(),
        itemId: null,
        youtubeUrl: '',
        hint: '',
        startTime: '',
        videoDurationSeconds: null,
        answers: [''],
        hintTime: null,
        playDurationSeconds:
            MAP_CREATE_POLICY.API_FALLBACK_PLAY_DURATION_SECONDS,
    };
}

function hasMapItemChanges(
    item: MapItemResponse,
    request: CreateMapItemRequest,
) {
    return (
        item.youtubeUrl !== request.youtubeUrl ||
        item.startTime !== request.startTime ||
        item.endTime !== request.endTime ||
        item.hint !== request.hint ||
        item.hintTime !== (request.hintTime ?? item.hintTime) ||
        item.answers.length !== request.answers.length ||
        item.answers.some(
            (answer, index) => answer !== request.answers[index],
        )
    );
}

async function synchronizeMapItems(
    mapId: number,
    originalItems: MapItemResponse[],
    songs: ManageMapSongFormState[],
    onApplied: () => void,
) {
    const retainedItemIds = new Set(
        songs.flatMap((song) => song.itemId == null ? [] : [song.itemId]),
    );
    const deletedItems = originalItems.filter(
        (item) => !retainedItemIds.has(item.id),
    );

    for (const item of deletedItems) {
        await deleteMapItem(mapId, item.id);
        onApplied();
    }

    const existingSongs = songs.filter(
        (song): song is ManageMapSongFormState & { itemId: number } =>
            song.itemId != null,
    );
    const existingItemIds = existingSongs.map((song) => song.itemId);
    const originalItemsById = new Map(
        originalItems.map((item) => [item.id, item]),
    );

    if (existingItemIds.length > 0) {
        await reorderMapItems(mapId, { itemIds: existingItemIds });
        onApplied();
    }

    for (const [index, song] of existingSongs.entries()) {
        const originalItem = originalItemsById.get(song.itemId);
        const request = createMapItemRequestFromSong(song, index + 1);

        if (
            originalItem &&
            !hasMapItemChanges(originalItem, request)
        ) {
            continue;
        }

        await updateMapItem(
            mapId,
            song.itemId,
            request,
        );
        onApplied();
    }

    const createdItemIds = new Map<string, number>();
    const newSongs = songs.filter((song) => song.itemId == null);

    for (const [index, song] of newSongs.entries()) {
        const createdItem = await createMapItem(
            mapId,
            createMapItemRequestFromSong(
                song,
                existingSongs.length + index + 1,
            ),
        );
        createdItemIds.set(song.id, createdItem.id);
        onApplied();
    }

    const finalItemIds = songs.map((song) => {
        const itemId = song.itemId ?? createdItemIds.get(song.id);

        if (itemId == null) {
            throw new Error('저장된 곡 ID를 확인할 수 없습니다.');
        }

        return itemId;
    });

    await reorderMapItems(mapId, { itemIds: finalItemIds });
    onApplied();
}

function MapManageLoadingCard({ message }: { message: string }) {
    return (
        <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-white px-6 text-sm font-medium text-[var(--monomat-text-muted)] shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <span className="animate-pulse">{message}</span>
        </div>
    );
}

function MapManageErrorCard({
    title,
    error,
    onRetry,
}: {
    title: string;
    error: unknown;
    onRetry: () => void;
}) {
    return (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <p className="text-base font-bold text-[var(--monomat-text-strong)]">
                {title}
            </p>
            <p className="mt-2 max-w-[520px] text-sm text-[var(--monomat-text-muted)]">
                {getErrorMessage(error, title)}
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-5 h-9 rounded-lg bg-[var(--monomat-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
            >
                {MAP_MANAGE_PAGE_COPY.RETRY}
            </button>
        </div>
    );
}

export function MapManage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mapId: mapIdParam } = useParams();
    const parsedMapId = Number(mapIdParam);
    const isValidMapId =
        Number.isInteger(parsedMapId) && parsedMapId > 0;
    const mapId = isValidMapId ? parsedMapId : 0;

    const [selectedItem, setSelectedItem] =
        useState<MapItemResponse | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] =
        useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editSongs, setEditSongs] =
        useState<ManageMapSongFormState[]>([]);
    const [songEditErrorMessage, setSongEditErrorMessage] =
        useState<string | null>(null);

    const mapDetailQuery = useQuery<MapDetailResponse>({
        queryKey: ['myMapDetail', mapId],
        queryFn: () => getMyMapDetail(mapId),
        enabled: isValidMapId,
    });
    const mapItemsQuery = useQuery<MapItemResponse[]>({
        queryKey: ['mapItems', mapId],
        queryFn: () => getMapItems(mapId),
        enabled: isValidMapId,
    });

    const updateMapMutation = useMutation({
        mutationFn: async ({
            mapRequest,
            songs,
        }: SaveMapManageChanges) => {
            let hasAppliedChange = false;

            try {
                await synchronizeMapItems(
                    mapId,
                    mapItemsQuery.data ?? [],
                    songs,
                    () => {
                        hasAppliedChange = true;
                    },
                );
                const updatedMap = await updateMap(mapId, mapRequest);
                hasAppliedChange = true;

                return updatedMap;
            } catch (error) {
                const message = getErrorMessage(
                    error,
                    MAP_MANAGE_PAGE_COPY.UPDATE_ERROR,
                );

                if (hasAppliedChange) {
                    throw new Error(
                        `${MAP_MANAGE_PAGE_COPY.UPDATE_PARTIAL_ERROR} ${message}`,
                    );
                }

                throw error;
            }
        },
        onSuccess: async (updatedMap) => {
            queryClient.setQueryData(
                ['myMapDetail', mapId],
                updatedMap,
            );
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['myMapDetail', mapId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['myMaps'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['mapItems', mapId],
                }),
            ]);
        },
        onError: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['myMapDetail', mapId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['myMaps'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['mapItems', mapId],
                }),
            ]);
        },
    });

    const deleteMapMutation = useMutation({
        mutationFn: () => deleteMap(mapId),
        onMutate: () => {
            setDeleteErrorMessage(null);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['myMaps'],
            });
            queryClient.removeQueries({
                queryKey: ['myMapDetail', mapId],
            });
            queryClient.removeQueries({
                queryKey: ['mapItems', mapId],
            });
            navigate(MAP_ROUTES.MY_MAPS, { replace: true });
        },
        onError: (error) => {
            setDeleteErrorMessage(
                getErrorMessage(
                    error,
                    MAP_DELETE_CONFIRM_MODAL_COPY.ERROR_FALLBACK,
                ),
            );
        },
    });

    const handleCreateLobby = () => {
        const searchParams = new URLSearchParams({
            [LOBBY_QUERY_PARAMS.MAP_ID]: String(mapId),
        });

        navigate(`${LOBBY_ROUTES.CREATE_LOBBY}?${searchParams.toString()}`);
    };

    const handleSave = async (request: UpdateMapRequest) => {
        setSongEditErrorMessage(null);

        if (editSongs.length < MAP_CREATE_POLICY.MIN_SONG_COUNT) {
            setSongEditErrorMessage(
                MAP_MANAGE_PAGE_COPY.EDIT_EMPTY_SONG_ERROR,
            );
            throw new Error(MAP_MANAGE_PAGE_COPY.EDIT_EMPTY_SONG_ERROR);
        }

        if (!editSongs.every(isValidMapSongForm)) {
            setSongEditErrorMessage(
                MAP_MANAGE_PAGE_COPY.EDIT_INVALID_SONG_ERROR,
            );
            throw new Error(MAP_MANAGE_PAGE_COPY.EDIT_INVALID_SONG_ERROR);
        }

        await updateMapMutation.mutateAsync({
            mapRequest: request,
            songs: editSongs,
        });
    };

    const handleEditingChange = (nextIsEditing: boolean) => {
        updateMapMutation.reset();
        setSongEditErrorMessage(null);
        setIsEditing(nextIsEditing);

        if (nextIsEditing) {
            const items = [...(mapItemsQuery.data ?? [])].sort(
                (first, second) => first.orderNum - second.orderNum,
            );
            setEditSongs(items.map(createManageSongForm));
        } else {
            setEditSongs([]);
        }
    };

    const updateEditSong = (
        songId: string,
        field: 'youtubeUrl' | 'hint' | 'startTime',
        value: string,
    ) => {
        setEditSongs((current) =>
            current.map((song) =>
                song.id === songId
                    ? {
                        ...song,
                        [field]: value,
                        ...(field === 'youtubeUrl'
                            ? { videoDurationSeconds: null }
                            : {}),
                    }
                    : song,
            ),
        );
        setSongEditErrorMessage(null);
    };

    const updateEditSongDuration = (
        songId: string,
        videoDurationSeconds: number | null,
    ) => {
        setEditSongs((current) =>
            current.map((song) =>
                song.id === songId
                    ? { ...song, videoDurationSeconds }
                    : song,
            ),
        );
    };

    const updateEditAnswer = (
        songId: string,
        answerIndex: number,
        value: string,
    ) => {
        setEditSongs((current) =>
            current.map((song) =>
                song.id === songId
                    ? {
                        ...song,
                        answers: song.answers.map((answer, index) =>
                            index === answerIndex ? value : answer,
                        ),
                    }
                    : song,
            ),
        );
        setSongEditErrorMessage(null);
    };

    const addEditSong = () => {
        setEditSongs((current) =>
            current.length >= MAP_CREATE_POLICY.MAX_SONG_COUNT
                ? current
                : [...current, createEmptyManageSong()],
        );
        setSongEditErrorMessage(null);
    };

    const deleteEditSong = (songId: string) => {
        setEditSongs((current) =>
            current.length <= MAP_CREATE_POLICY.MIN_SONG_COUNT
                ? current
                : current.filter((song) => song.id !== songId),
        );
        setSongEditErrorMessage(null);
    };

    const moveEditSong = (songId: string, direction: -1 | 1) => {
        setEditSongs((current) => {
            const currentIndex = current.findIndex(
                (song) => song.id === songId,
            );
            const targetIndex = currentIndex + direction;

            if (
                currentIndex < 0 ||
                targetIndex < 0 ||
                targetIndex >= current.length
            ) {
                return current;
            }

            const nextSongs = [...current];
            [nextSongs[currentIndex], nextSongs[targetIndex]] = [
                nextSongs[targetIndex],
                nextSongs[currentIndex],
            ];

            return nextSongs;
        });
        setSongEditErrorMessage(null);
    };

    const addEditAnswer = (songId: string) => {
        setEditSongs((current) =>
            current.map((song) =>
                song.id === songId &&
                song.answers.length < MAP_CREATE_POLICY.MAX_ANSWER_COUNT
                    ? { ...song, answers: [...song.answers, ''] }
                    : song,
            ),
        );
        setSongEditErrorMessage(null);
    };

    const deleteEditAnswer = (
        songId: string,
        answerIndex: number,
    ) => {
        setEditSongs((current) =>
            current.map((song) =>
                song.id === songId &&
                song.answers.length >
                    MAP_CREATE_POLICY.MIN_ANSWER_COUNT
                    ? {
                        ...song,
                        answers: song.answers.filter(
                            (_, index) => index !== answerIndex,
                        ),
                    }
                    : song,
            ),
        );
        setSongEditErrorMessage(null);
    };

    const handleDeleteClick = () => {
        if (deleteMapMutation.isPending) {
            return;
        }

        setDeleteErrorMessage(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteModalClose = () => {
        if (deleteMapMutation.isPending) {
            return;
        }

        setDeleteErrorMessage(null);
        setIsDeleteModalOpen(false);
    };

    if (!isValidMapId) {
        return (
            <div className="flex min-h-screen flex-col bg-[var(--monomat-page-bg)] text-left">
                <NavigationBar />
                <main className="mx-auto flex w-full max-w-[950px] flex-1 items-center px-6 py-10">
                    <div className="w-full rounded-2xl bg-white px-8 py-12 text-center shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
                        <h1 className="!m-0 !text-2xl !font-extrabold !text-[var(--monomat-text-strong)]">
                            {MAP_MANAGE_PAGE_COPY.INVALID_MAP_ID_TITLE}
                        </h1>
                        <p className="mt-3 text-sm text-[var(--monomat-text-muted)]">
                            {
                                MAP_MANAGE_PAGE_COPY.INVALID_MAP_ID_DESCRIPTION
                            }
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate(MAP_ROUTES.MY_MAPS)}
                            className="mt-6 h-10 rounded-lg bg-[var(--monomat-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
                        >
                            {MAP_MANAGE_PAGE_COPY.BACK_TO_MAPS}
                        </button>
                    </div>
                </main>
                <LobbyFooter />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-[var(--monomat-page-bg)] text-left text-[var(--monomat-text-strong)]">
            <NavigationBar />

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-16 pt-[30px] sm:px-6 lg:px-8 xl:px-10">
                <div className="mx-auto w-full max-w-[950px]">
                    <button
                        type="button"
                        onClick={() => navigate(MAP_ROUTES.MY_MAPS)}
                        className="h-[30px] text-base font-semibold text-[var(--monomat-text-muted)] transition hover:text-[var(--monomat-text-strong)]"
                    >
                        {MAP_MANAGE_PAGE_COPY.BACK_TO_MAPS}
                    </button>

                    <div className="mt-[15px]">
                        {mapDetailQuery.isLoading ? (
                            <MapManageLoadingCard
                                message={
                                    MAP_MANAGE_PAGE_COPY.SUMMARY_LOADING
                                }
                            />
                        ) : mapDetailQuery.isError ? (
                            <MapManageErrorCard
                                title={
                                    MAP_MANAGE_PAGE_COPY.SUMMARY_ERROR_TITLE
                                }
                                error={mapDetailQuery.error}
                                onRetry={() => void mapDetailQuery.refetch()}
                            />
                        ) : mapDetailQuery.data ? (
                            <MapManageSummary
                                map={mapDetailQuery.data}
                                isUpdating={updateMapMutation.isPending}
                                updateErrorMessage={
                                    songEditErrorMessage ??
                                    (updateMapMutation.isError
                                        ? getErrorMessage(
                                            updateMapMutation.error,
                                            MAP_MANAGE_PAGE_COPY.UPDATE_ERROR,
                                        )
                                        : null)
                                }
                                onCreateLobby={handleCreateLobby}
                                onDelete={handleDeleteClick}
                                onSave={handleSave}
                                onEditingChange={handleEditingChange}
                                isEditDisabled={
                                    mapItemsQuery.isLoading ||
                                    mapItemsQuery.isError
                                }
                                editContent={
                                    <MapManageSongEditor
                                        songs={editSongs}
                                        disabled={
                                            updateMapMutation.isPending
                                        }
                                        onAddSong={addEditSong}
                                        onChange={updateEditSong}
                                        onAnswerChange={updateEditAnswer}
                                        onDurationChange={
                                            updateEditSongDuration
                                        }
                                        onAddAnswer={addEditAnswer}
                                        onDeleteAnswer={deleteEditAnswer}
                                        onDeleteSong={deleteEditSong}
                                        onMoveUp={(songId) =>
                                            moveEditSong(songId, -1)
                                        }
                                        onMoveDown={(songId) =>
                                            moveEditSong(songId, 1)
                                        }
                                    />
                                }
                            />
                        ) : null}
                    </div>

                    {!isEditing && (
                        <>
                            <h2 className="!mb-0 !mt-[27px] !text-lg !font-bold !leading-[21px] !text-black">
                                {MAP_MANAGE_PAGE_COPY.SONG_LIST_TITLE}
                            </h2>

                            <div className="mt-[11px]">
                                {mapItemsQuery.isLoading ? (
                                    <MapManageLoadingCard
                                        message={
                                            MAP_MANAGE_PAGE_COPY.ITEMS_LOADING
                                        }
                                    />
                                ) : mapItemsQuery.isError ? (
                                    <MapManageErrorCard
                                        title={
                                            MAP_MANAGE_PAGE_COPY.ITEMS_ERROR_TITLE
                                        }
                                        error={mapItemsQuery.error}
                                        onRetry={() =>
                                            void mapItemsQuery.refetch()
                                        }
                                    />
                                ) : (
                                    <MapManageSongList
                                        items={mapItemsQuery.data ?? []}
                                        onItemClick={setSelectedItem}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

            <LobbyFooter />

            {selectedItem && (
                <MapItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {isDeleteModalOpen && mapDetailQuery.data && (
                <MapDeleteConfirmModal
                    mapTitle={mapDetailQuery.data.title}
                    isDeleting={deleteMapMutation.isPending}
                    errorMessage={deleteErrorMessage}
                    onCancel={handleDeleteModalClose}
                    onConfirm={() => deleteMapMutation.mutate()}
                />
            )}
        </div>
    );
}
