import { type ReactNode, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Gamepad2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    startLobbyGame,
    updateLobbyMap,
    updateLobbyReady,
} from '../api/lobbyApi';
import { NavigationBar } from '../components/common/NavigationBar';
import { HostLobbyActionCard } from '../components/lobby/HostLobbyActionCard';
import { LobbyChatPlaceholder } from '../components/lobby/LobbyChatPlaceholder';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { LobbyHeaderCard } from '../components/lobby/LobbyHeaderCard';
import { LobbyMapInfoCard } from '../components/lobby/LobbyMapInfoCard';
import { LobbyPlayersCard } from '../components/lobby/LobbyPlayersCard';
import { LobbyRoomLayout } from '../components/lobby/LobbyRoomLayout';
import { LobbyRoomTopControls } from '../components/lobby/LobbyRoomTopControls';
import { MapSelectModal } from '../components/lobby/MapSelectModal';
import { LOBBY_ROOM_COPY, LOBBY_ROUTES } from '../constants/lobby';
import {
    lobbyDetailQueryKey,
    useLobbyDetail,
} from '../hooks/useLobbyDetail';
import { useLobbySocket } from '../hooks/useLobbySocket';
import { useAuthStore } from '../store/useAuthStore';
import type { MapSummary } from '../types/map';

interface LobbyActionMessage {
    inviteCode: string;
    message: string;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function getHostStartGuideMessage({
    canStart,
    hasSelectedMap,
    readyTargetCount,
    waitingCount,
}: {
    canStart: boolean;
    hasSelectedMap: boolean;
    readyTargetCount: number;
    waitingCount: number;
}) {
    if (canStart) {
        return LOBBY_ROOM_COPY.START_GUIDE_AVAILABLE;
    }

    if (!hasSelectedMap) {
        return LOBBY_ROOM_COPY.START_GUIDE_MAP_MISSING;
    }

    if (readyTargetCount === 0) {
        return LOBBY_ROOM_COPY.START_GUIDE_PLAYER_REQUIRED;
    }

    if (waitingCount > 0) {
        return LOBBY_ROOM_COPY.START_GUIDE_WAITING_PLAYERS;
    }

    return LOBBY_ROOM_COPY.START_GUIDE_SERVER_UNAVAILABLE;
}

function LobbyRoomShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-[var(--monomat-page-bg)]">
            <NavigationBar />
            {children}
            <LobbyFooter />
        </div>
    );
}

function LobbyRoomStateCard({
    title,
    description,
    onBack,
    isError = false,
}: {
    title: string;
    description: string;
    onBack?: () => void;
    isError?: boolean;
}) {
    return (
        <section className="w-full max-w-xl rounded-lg bg-white px-6 py-9 text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[color:var(--monomat-border-card)] sm:px-8">
            <h1 className="!m-0 !text-2xl !font-extrabold !text-[var(--monomat-text-strong)]">
                {title}
            </h1>
            <p
                className={`mt-4 break-keep text-sm font-medium ${
                    isError
                        ? 'text-[var(--monomat-danger)]'
                        : 'text-[var(--monomat-text-muted)]'
                }`}
            >
                {description}
            </p>
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="mt-6 h-10 rounded-lg bg-[var(--monomat-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
                >
                    {LOBBY_ROOM_COPY.GO_TO_LOBBY_LIST}
                </button>
            )}
        </section>
    );
}

function LobbyRoomLoadingState() {
    return (
        <LobbyRoomShell>
            <main className="flex flex-1 items-center justify-center px-4 py-10">
                <section className="w-full max-w-xl rounded-lg bg-white px-6 py-9 text-left shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[color:var(--monomat-border-card)] sm:px-8">
                    <div className="h-[24px] w-[110px] animate-pulse rounded-full bg-[var(--monomat-page-bg)]" />
                    <div className="mt-5 h-[36px] w-3/4 animate-pulse rounded bg-[var(--monomat-page-bg)]" />
                    <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[var(--monomat-page-bg)]" />
                    <p className="mt-7 text-sm font-semibold text-[var(--monomat-text-muted)]">
                        {LOBBY_ROOM_COPY.FETCHING}
                    </p>
                </section>
            </main>
        </LobbyRoomShell>
    );
}

export function LobbyRoom() {
    const { inviteCode: inviteCodeParam } = useParams<{
        inviteCode: string;
    }>();
    const inviteCode = inviteCodeParam?.trim();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userIdentifier = useAuthStore((state) => state.userIdentifier);
    const { connectionStatus, gameStatus } = useLobbySocket(inviteCode);
    const {
        data: lobbyDetail,
        isLoading,
        isError,
        error,
    } = useLobbyDetail(inviteCode);

    const [actionMessage, setActionMessage] =
        useState<LobbyActionMessage | null>(null);
    const [actionErrorMessage, setActionErrorMessage] =
        useState<LobbyActionMessage | null>(null);
    const [isMapSelectModalOpen, setIsMapSelectModalOpen] = useState(false);

    const currentPlayer = useMemo(() => {
        if (!lobbyDetail || !userIdentifier) {
            return null;
        }

        return lobbyDetail.players.find(
            (player) => player.userIdentifier === userIdentifier,
        ) ?? null;
    }, [lobbyDetail, userIdentifier]);

    const isHost = Boolean(
        lobbyDetail &&
        userIdentifier &&
        lobbyDetail.hostId === userIdentifier,
    );
    const currentReady = currentPlayer?.ready ?? false;
    const readySummary = useMemo(() => {
        const players = lobbyDetail?.players ?? [];
        const nonHostPlayers = players.filter((player) => !player.host);
        const readyPlayers = nonHostPlayers.filter((player) => player.ready);
        const waitingPlayers = nonHostPlayers.filter((player) => !player.ready);

        return {
            totalPlayerCount: players.length,
            readyTargetCount: nonHostPlayers.length,
            readyCount: readyPlayers.length,
            waitingCount: waitingPlayers.length,
        };
    }, [lobbyDetail]);

    const handleNavigateLobbyList = () => {
        navigate(LOBBY_ROUTES.LIST);
    };

    const invalidateLobbyDetail = async () => {
        if (!inviteCode) {
            return;
        }

        await queryClient.invalidateQueries({
            queryKey: lobbyDetailQueryKey(inviteCode),
        });
    };

    const readyMutation = useMutation({
        mutationFn: (ready: boolean) => {
            if (!inviteCode) {
                throw new Error(LOBBY_ROOM_COPY.INVALID_INVITE_CODE);
            }

            return updateLobbyReady(inviteCode, { ready });
        },
        onMutate: () => {
            setActionMessage(null);
            setActionErrorMessage(null);
        },
        onSuccess: async () => {
            await invalidateLobbyDetail();
        },
        onError: (mutationError) => {
            if (!inviteCode) {
                return;
            }

            setActionErrorMessage({
                inviteCode,
                message: getErrorMessage(
                    mutationError,
                    LOBBY_ROOM_COPY.READY_CHANGE_FAILED,
                ),
            });
        },
    });

    const mapMutation = useMutation({
        mutationFn: (map: MapSummary) => {
            if (!inviteCode) {
                throw new Error(LOBBY_ROOM_COPY.INVALID_INVITE_CODE);
            }

            return updateLobbyMap(inviteCode, { mapId: map.mapId });
        },
        onMutate: () => {
            setActionMessage(null);
            setActionErrorMessage(null);
        },
        onSuccess: async () => {
            await invalidateLobbyDetail();
        },
        onError: (mutationError) => {
            if (!inviteCode) {
                return;
            }

            setActionErrorMessage({
                inviteCode,
                message: getErrorMessage(
                    mutationError,
                    LOBBY_ROOM_COPY.MAP_CHANGE_FAILED,
                ),
            });
        },
    });

    const startMutation = useMutation({
        mutationFn: () => {
            if (!inviteCode) {
                throw new Error(LOBBY_ROOM_COPY.INVALID_INVITE_CODE);
            }

            return startLobbyGame(inviteCode);
        },
        onMutate: () => {
            setActionMessage(null);
            setActionErrorMessage(null);
        },
        onSuccess: async () => {
            if (inviteCode) {
                setActionMessage({
                    inviteCode,
                    message: LOBBY_ROOM_COPY.START_REQUESTED,
                });
            }

            await invalidateLobbyDetail();
        },
        onError: (mutationError) => {
            if (!inviteCode) {
                return;
            }

            setActionErrorMessage({
                inviteCode,
                message: getErrorMessage(
                    mutationError,
                    LOBBY_ROOM_COPY.START_FAILED,
                ),
            });
        },
    });

    const handleReadyClick = () => {
        if (!currentPlayer || isHost || readyMutation.isPending) {
            return;
        }

        readyMutation.mutate(!currentReady);
    };

    const handleStartClick = () => {
        if (
            !isHost ||
            !lobbyDetail?.canStart ||
            startMutation.isPending ||
            mapMutation.isPending
        ) {
            return;
        }

        startMutation.mutate();
    };

    const handleMapChangeClick = () => {
        if (
            !isHost ||
            lobbyDetail?.status !== 'WAITING' ||
            mapMutation.isPending ||
            startMutation.isPending
        ) {
            return;
        }

        setActionMessage(null);
        setActionErrorMessage(null);
        setIsMapSelectModalOpen(true);
    };

    const handleMapConfirm = (map: MapSummary) => {
        if (!isHost || mapMutation.isPending) {
            return;
        }

        if (map.mapId === lobbyDetail?.mapId) {
            return;
        }

        mapMutation.mutate(map);
    };

    if (!inviteCode) {
        return (
            <LobbyRoomShell>
                <main className="flex flex-1 items-center justify-center px-4 py-10">
                    <LobbyRoomStateCard
                        title={LOBBY_ROOM_COPY.INVALID_ACCESS_TITLE}
                        description={LOBBY_ROOM_COPY.INVALID_ACCESS_DESCRIPTION}
                        onBack={handleNavigateLobbyList}
                    />
                </main>
            </LobbyRoomShell>
        );
    }

    if (isLoading) {
        return <LobbyRoomLoadingState />;
    }

    if (isError || !lobbyDetail) {
        return (
            <LobbyRoomShell>
                <main className="flex flex-1 items-center justify-center px-4 py-10">
                    <LobbyRoomStateCard
                        title={LOBBY_ROOM_COPY.FETCH_ERROR_TITLE}
                        description={getErrorMessage(
                            error,
                            LOBBY_ROOM_COPY.FETCH_ERROR_DESCRIPTION,
                        )}
                        onBack={handleNavigateLobbyList}
                        isError
                    />
                </main>
            </LobbyRoomShell>
        );
    }

    const isReadyButtonDisabled =
        readyMutation.isPending || !currentPlayer || isHost;
    const isWaitingLobby = lobbyDetail.status === 'WAITING';
    const hasSelectedMap =
        lobbyDetail.mapId != null && Boolean(lobbyDetail.mapTitle?.trim());
    const hostStartGuideMessage = getHostStartGuideMessage({
        canStart: lobbyDetail.canStart,
        hasSelectedMap,
        readyTargetCount: readySummary.readyTargetCount,
        waitingCount: readySummary.waitingCount,
    });
    const displayedHostStartGuideMessage = mapMutation.isPending
        ? LOBBY_ROOM_COPY.MAP_CHANGE_PENDING_GUIDE
        : hostStartGuideMessage;
    const currentActionMessage =
        actionMessage?.inviteCode === inviteCode ? actionMessage.message : null;
    const currentActionErrorMessage =
        actionErrorMessage?.inviteCode === inviteCode
            ? actionErrorMessage.message
            : null;

    return (
        <LobbyRoomShell>
            <main className="flex flex-1 flex-col px-4 py-[17px] text-left sm:px-6 lg:px-8 xl:px-10">
                <LobbyRoomLayout
                    backNavigation={
                        <button
                            type="button"
                            onClick={handleNavigateLobbyList}
                            className="h-5 w-fit text-base font-semibold leading-5 text-[var(--monomat-text-muted)] transition hover:text-[var(--monomat-text-strong)]"
                        >
                            ← {LOBBY_ROOM_COPY.GO_TO_LOBBY_LIST}
                        </button>
                    }
                    topControls={
                        <LobbyRoomTopControls
                            inviteCode={lobbyDetail.inviteCode}
                            status={lobbyDetail.status}
                        />
                    }
                    feedbackSlot={
                        (currentActionErrorMessage ||
                            currentActionMessage ||
                            gameStatus === 'started') && (
                            <section
                                role={
                                    currentActionErrorMessage
                                        ? 'alert'
                                        : 'status'
                                }
                                className={`rounded-lg px-5 py-4 text-sm font-bold shadow-[0_4px_16px_rgba(0,0,0,0.05)] ring-1 ${
                                    currentActionErrorMessage
                                        ? 'bg-[var(--monomat-danger-light)] text-[var(--monomat-danger)] ring-red-100'
                                        : 'bg-[var(--monomat-primary-light)] text-[var(--monomat-primary)] ring-blue-100'
                                }`}
                            >
                                {currentActionErrorMessage ??
                                    (gameStatus === 'started'
                                        ? LOBBY_ROOM_COPY.GAME_STARTED_PENDING_ROUTE
                                        : currentActionMessage)}
                            </section>
                        )
                    }
                    titleCard={
                        <LobbyHeaderCard
                            title={lobbyDetail.title}
                            mapTitle={lobbyDetail.mapTitle}
                            mapCategory={lobbyDetail.mapCategory}
                            questionCount={lobbyDetail.questionCount}
                            canChangeMap={isHost && isWaitingLobby}
                            isMapChangePending={mapMutation.isPending}
                            onMapChangeClick={handleMapChangeClick}
                        />
                    }
                    playersCard={
                        <LobbyPlayersCard
                            players={lobbyDetail.players}
                            currentPlayers={lobbyDetail.currentPlayers}
                            maxPlayers={lobbyDetail.maxPlayers}
                            currentUserIdentifier={userIdentifier}
                        />
                    }
                    settingsCard={
                        <LobbyMapInfoCard
                            questionCount={lobbyDetail.questionCount}
                            timeLimitSeconds={lobbyDetail.timeLimitSeconds}
                            maxPlayers={lobbyDetail.maxPlayers}
                        />
                    }
                    actionSlot={
                        isHost ? (
                            <HostLobbyActionCard
                                canStart={
                                    lobbyDetail.canStart &&
                                    !mapMutation.isPending
                                }
                                isStarting={startMutation.isPending}
                                startGuideMessage={
                                    displayedHostStartGuideMessage
                                }
                                totalPlayerCount={
                                    readySummary.totalPlayerCount
                                }
                                readyTargetCount={
                                    readySummary.readyTargetCount
                                }
                                readyCount={readySummary.readyCount}
                                waitingCount={readySummary.waitingCount}
                                onStartClick={handleStartClick}
                            />
                        ) : (
                            <section aria-label={LOBBY_ROOM_COPY.ACTION_TITLE}>
                                <p className="sr-only">
                                    {currentPlayer
                                        ? LOBBY_ROOM_COPY.READY_SYNCED
                                        : LOBBY_ROOM_COPY.READY_WAIT_PLAYER}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleReadyClick}
                                    disabled={isReadyButtonDisabled}
                                    className={`flex h-[45px] w-full items-center justify-center gap-2 rounded-lg text-base font-bold leading-none text-white transition disabled:cursor-not-allowed disabled:bg-[#D3D3D7] ${
                                        currentReady
                                            ? 'bg-[var(--monomat-text-strong)] hover:bg-black'
                                            : 'bg-[#00B368] hover:bg-[#009b5a]'
                                    }`}
                                >
                                    <Gamepad2
                                        size={20}
                                        strokeWidth={2.3}
                                        aria-hidden="true"
                                    />
                                    {readyMutation.isPending
                                        ? LOBBY_ROOM_COPY.READY_PENDING
                                        : currentReady
                                            ? LOBBY_ROOM_COPY.CANCEL_READY
                                            : LOBBY_ROOM_COPY.SUBMIT_READY}
                                </button>
                            </section>
                        )
                    }
                    chatSlot={
                        <LobbyChatPlaceholder
                            connectionStatus={connectionStatus}
                        />
                    }
                />
            </main>

            <MapSelectModal
                isOpen={isMapSelectModalOpen}
                selectedMap={null}
                selectedMapId={lobbyDetail.mapId}
                onConfirm={handleMapConfirm}
                onClose={() => setIsMapSelectModalOpen(false)}
            />
        </LobbyRoomShell>
    );
}
