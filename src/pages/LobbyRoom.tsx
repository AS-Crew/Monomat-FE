import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { startLobbyGame, updateLobbyReady } from '../api/lobbyApi';
import { NavigationBar } from '../components/common/NavigationBar';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import {
    lobbyDetailQueryKey,
    useLobbyDetail,
} from '../hooks/useLobbyDetail';
import { useLobbySocket } from '../hooks/useLobbySocket';
import { useAuthStore } from '../store/useAuthStore';

import type { LobbyPlayerResponse } from '../types/lobby';

interface LobbyActionMessage {
    inviteCode: string;
    message: string;
}

const SOCKET_STATUS_LABEL = {
    connected: 'connected',
    connecting: 'connecting',
    disconnected: 'disconnected',
} as const;

const SOCKET_STATUS_CLASS_NAME = {
    connected: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    connecting: 'bg-amber-50 text-amber-700 ring-amber-200',
    disconnected: 'bg-red-50 text-red-700 ring-red-200',
} as const;

function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function maskUserIdentifier(userIdentifier: string) {
    if (userIdentifier.length <= 10) {
        return userIdentifier;
    }

    return `${userIdentifier.slice(0, 4)}...${userIdentifier.slice(-4)}`;
}

function formatMapInfo(
    mapTitle: string | null,
    mapCategory: string | null,
) {
    if (!mapTitle) {
        return '선택된 맵 없음';
    }

    return mapCategory ? `${mapTitle} · ${mapCategory}` : mapTitle;
}

function PlayerReadyBadge({ player }: { player: LobbyPlayerResponse }) {
    if (player.host) {
        return (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                방장
            </span>
        );
    }

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                player.ready
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                    : 'bg-gray-100 text-gray-500 ring-gray-200'
            }`}
        >
            {player.ready ? '준비 완료' : '대기 중'}
        </span>
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
                throw new Error('초대 코드가 올바르지 않습니다.');
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
                    '준비 상태 변경에 실패했습니다.',
                ),
            });
        },
    });

    const startMutation = useMutation({
        mutationFn: () => {
            if (!inviteCode) {
                throw new Error('초대 코드가 올바르지 않습니다.');
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
                    message: '게임 시작 요청을 보냈습니다.',
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
                    '게임 시작에 실패했습니다.',
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
        if (!isHost || !lobbyDetail?.canStart || startMutation.isPending) {
            return;
        }

        startMutation.mutate();
    };

    if (!inviteCode) {
        return (
            <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
                <NavigationBar />

                <main className="flex flex-1 items-center justify-center px-9">
                    <section className="w-full max-w-xl rounded-lg bg-white px-8 py-10 text-center shadow-sm ring-1 ring-gray-200">
                        <h1 className="mb-4 text-2xl font-bold text-gray-900">
                            잘못된 로비 접근입니다.
                        </h1>
                        <p className="mb-6 text-sm text-gray-500">
                            초대 코드가 포함된 로비 주소로 다시 접속해주세요.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/lobbies')}
                            className="rounded-lg bg-[#0B1E46] px-5 py-3 text-sm font-bold text-white hover:bg-[#12306B]"
                        >
                            로비 목록으로 이동
                        </button>
                    </section>
                </main>

                <LobbyFooter />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
                <NavigationBar />

                <main className="flex flex-1 items-center justify-center text-gray-500">
                    로비 정보를 불러오는 중...
                </main>

                <LobbyFooter />
            </div>
        );
    }

    if (isError || !lobbyDetail) {
        return (
            <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
                <NavigationBar />

                <main className="flex flex-1 items-center justify-center px-9">
                    <section className="w-full max-w-xl rounded-lg bg-white px-8 py-10 text-center shadow-sm ring-1 ring-gray-200">
                        <h1 className="mb-4 text-2xl font-bold text-gray-900">
                            로비 정보를 불러오지 못했습니다.
                        </h1>
                        <p className="mb-6 text-sm text-red-500">
                            {getErrorMessage(
                                error,
                                '잠시 후 다시 시도해주세요.',
                            )}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/lobbies')}
                            className="rounded-lg bg-[#0B1E46] px-5 py-3 text-sm font-bold text-white hover:bg-[#12306B]"
                        >
                            로비 목록으로 이동
                        </button>
                    </section>
                </main>

                <LobbyFooter />
            </div>
        );
    }

    const isReadyButtonDisabled =
        readyMutation.isPending || !currentPlayer || isHost;
    const isStartButtonDisabled =
        startMutation.isPending || !lobbyDetail.canStart;
    const currentActionMessage =
        actionMessage?.inviteCode === inviteCode ? actionMessage.message : null;
    const currentActionErrorMessage =
        actionErrorMessage?.inviteCode === inviteCode
            ? actionErrorMessage.message
            : null;

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
            <NavigationBar />

            <main className="flex flex-1 flex-col gap-5 px-9 py-6 text-left">
                <section className="flex items-start justify-between gap-6 rounded-lg bg-white px-8 py-7 shadow-sm ring-1 ring-gray-200">
                    <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                {lobbyDetail.status}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                                    SOCKET_STATUS_CLASS_NAME[connectionStatus]
                                }`}
                            >
                                socket {SOCKET_STATUS_LABEL[connectionStatus]}
                            </span>
                        </div>

                        <h1 className="m-0 truncate text-3xl font-bold text-gray-900">
                            {lobbyDetail.title}
                        </h1>

                        <p className="mt-3 text-sm text-gray-500">
                            초대 코드
                            <span className="ml-2 rounded-md bg-gray-100 px-3 py-1 font-mono text-sm font-bold text-gray-900">
                                {lobbyDetail.inviteCode}
                            </span>
                        </p>
                    </div>

                    <div className="grid min-w-[220px] grid-cols-2 gap-3 text-center">
                        <div className="rounded-lg bg-[#F5F5F7] px-4 py-3">
                            <p className="text-xs font-bold text-gray-500">
                                현재 인원
                            </p>
                            <p className="mt-1 text-xl font-bold text-gray-900">
                                {lobbyDetail.currentPlayers}/
                                {lobbyDetail.maxPlayers}
                            </p>
                        </div>

                        <div className="rounded-lg bg-[#F5F5F7] px-4 py-3">
                            <p className="text-xs font-bold text-gray-500">
                                내 역할
                            </p>
                            <p className="mt-1 text-xl font-bold text-gray-900">
                                {isHost ? '방장' : '참가자'}
                            </p>
                        </div>
                    </div>
                </section>

                {(currentActionErrorMessage ||
                    currentActionMessage ||
                    gameStatus === 'started') && (
                    <section
                        role={currentActionErrorMessage ? 'alert' : 'status'}
                        className={`rounded-lg px-5 py-4 text-sm font-bold ${
                            currentActionErrorMessage
                                ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                                : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                        }`}
                    >
                        {currentActionErrorMessage ??
                            (gameStatus === 'started'
                                ? '게임이 시작되었습니다. 게임 화면 전환은 추후 연결됩니다.'
                                : currentActionMessage)}
                    </section>
                )}

                <section className="grid flex-1 grid-cols-[minmax(0,1fr)_360px] gap-5">
                    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <h2 className="m-0 text-xl font-bold text-gray-900">
                                참여자
                            </h2>
                            <span className="text-sm font-semibold text-gray-500">
                                {lobbyDetail.players.length}명 표시 중
                            </span>
                        </div>

                        {lobbyDetail.players.length > 0 ? (
                            <ul className="grid grid-cols-2 gap-3">
                                {lobbyDetail.players.map((player) => (
                                    <li
                                        key={player.userIdentifier}
                                        className="flex min-h-20 items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-sm font-bold text-gray-900">
                                                {maskUserIdentifier(
                                                    player.userIdentifier,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-gray-500">
                                                {player.userIdentifier ===
                                                userIdentifier
                                                    ? '나'
                                                    : '플레이어'}
                                            </p>
                                        </div>

                                        <PlayerReadyBadge player={player} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm font-semibold text-gray-400">
                                아직 표시할 참여자가 없습니다.
                            </div>
                        )}
                    </div>

                    <aside className="flex flex-col gap-5">
                        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <h2 className="m-0 text-xl font-bold text-gray-900">
                                로비 설정
                            </h2>

                            <dl className="mt-5 space-y-4 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="font-semibold text-gray-500">
                                        맵
                                    </dt>
                                    <dd className="max-w-[190px] text-right font-bold text-gray-900">
                                        {formatMapInfo(
                                            lobbyDetail.mapTitle,
                                            lobbyDetail.mapCategory,
                                        )}
                                    </dd>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <dt className="font-semibold text-gray-500">
                                        라운드 수
                                    </dt>
                                    <dd className="font-bold text-gray-900">
                                        {lobbyDetail.roundCount}라운드
                                    </dd>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <dt className="font-semibold text-gray-500">
                                        제한 시간
                                    </dt>
                                    <dd className="font-bold text-gray-900">
                                        {lobbyDetail.timeLimitSeconds}초
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <h2 className="m-0 text-xl font-bold text-gray-900">
                                액션
                            </h2>

                            {isHost ? (
                                <div className="mt-5">
                                    <button
                                        type="button"
                                        onClick={handleStartClick}
                                        disabled={isStartButtonDisabled}
                                        className="h-12 w-full rounded-lg bg-[#0B1E46] text-sm font-bold text-white hover:bg-[#12306B] disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >
                                        {startMutation.isPending
                                            ? '시작 요청 중...'
                                            : '게임 시작'}
                                    </button>
                                    <p className="mt-3 text-xs font-semibold text-gray-500">
                                        {lobbyDetail.canStart
                                            ? '현재 조회 기준으로 시작할 수 있습니다.'
                                            : '모든 참가자가 준비하면 시작할 수 있습니다.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5">
                                    <button
                                        type="button"
                                        onClick={handleReadyClick}
                                        disabled={isReadyButtonDisabled}
                                        className={`h-12 w-full rounded-lg text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300 ${
                                            currentReady
                                                ? 'bg-gray-700 hover:bg-gray-800'
                                                : 'bg-[#0B1E46] hover:bg-[#12306B]'
                                        }`}
                                    >
                                        {readyMutation.isPending
                                            ? '변경 중...'
                                            : currentReady
                                                ? '준비 취소'
                                                : '준비 완료'}
                                    </button>
                                    <p className="mt-3 text-xs font-semibold text-gray-500">
                                        {currentPlayer
                                            ? '준비 상태는 서버 이벤트로 다시 동기화됩니다.'
                                            : '참여자 정보 동기화 후 준비할 수 있습니다.'}
                                    </p>
                                </div>
                            )}
                        </section>
                    </aside>
                </section>
            </main>

            <LobbyFooter />
        </div>
    );
}
