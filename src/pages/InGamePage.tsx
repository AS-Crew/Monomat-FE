import { useNavigate, useParams } from 'react-router-dom';

import { GameChatPanel } from '../components/game/GameChatPanel';
import { GameHeader } from '../components/game/GameHeader';
import { GamePlayerPanel } from '../components/game/GamePlayerPanel';
import { GameRankingCard } from '../components/game/GameRankingCard';
import { GameRoundStatusBar } from '../components/game/GameRoundStatusBar';
import { GameUnifiedInput } from '../components/game/GameUnifiedInput';
import { InGameLayout } from '../components/game/InGameLayout';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { GAME_COPY } from '../constants/game';
import { LOBBY_ROUTES } from '../constants/lobby';
import { useGameSocket } from '../hooks/useGameSocket';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import {
    normalizeInviteCode,
    validateInviteCode,
} from '../utils/inviteCode';

import type {
    GameChatDisplayMessage,
    GameRankingEntry,
} from '../types/game';

function formatGameChatTime(timestamp: string) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function InGameStateCard({ onBack }: { onBack: () => void }) {
    return (
        <main className="flex flex-1 items-center justify-center px-4 py-10">
            <section className="w-full max-w-xl rounded-lg bg-white px-6 py-9 text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[color:var(--monomat-border-card)] sm:px-8">
                <h1 className="!m-0 !text-2xl !font-extrabold !text-[var(--monomat-text-strong)]">
                    {GAME_COPY.INVALID_ACCESS_TITLE}
                </h1>
                <p className="mt-4 break-keep text-sm font-medium text-[var(--monomat-text-muted)]">
                    {GAME_COPY.INVALID_ACCESS_DESCRIPTION}
                </p>
                <button
                    type="button"
                    onClick={onBack}
                    className="mt-6 h-10 rounded-lg bg-[var(--monomat-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
                >
                    {GAME_COPY.GO_TO_LOBBY_LIST}
                </button>
            </section>
        </main>
    );
}

export function InGamePage() {
    const { inviteCode: inviteCodeParam } = useParams<{
        inviteCode: string;
    }>();
    const navigate = useNavigate();
    const inviteCode = normalizeInviteCode(inviteCodeParam ?? '');
    const inviteCodeError = validateInviteCode(inviteCode);
    const validInviteCode = inviteCodeError ? undefined : inviteCode;
    const userIdentifier = useAuthStore((state) => state.userIdentifier);
    const gameInviteCode = useGameStore((state) => state.inviteCode);
    const rankings = useGameStore((state) => state.rankings);
    const chatMessages = useGameStore((state) => state.chatMessages);
    const currentRoundNo = useGameStore((state) => state.currentRoundNo);
    const roundReady = useGameStore((state) => state.roundReady);
    const playbackStarted = useGameStore(
        (state) => state.playbackStarted,
    );
    const roundSkipped = useGameStore((state) => state.roundSkipped);
    const roundEnd = useGameStore((state) => state.roundEnd);
    const playerReady = useGameStore((state) => state.playerReady);
    const playerBuffering = useGameStore(
        (state) => state.playerBuffering,
    );
    const playerPlaying = useGameStore(
        (state) => state.playerPlaying,
    );
    const playerErrorMessage = useGameStore(
        (state) => state.playerErrorMessage,
    );
    const markPlayerReady = useGameStore(
        (state) => state.markPlayerReady,
    );
    const markPlayerBuffering = useGameStore(
        (state) => state.markPlayerBuffering,
    );
    const markPlayerPlaying = useGameStore(
        (state) => state.markPlayerPlaying,
    );
    const markPlayerEnded = useGameStore(
        (state) => state.markPlayerEnded,
    );
    const setPlayerError = useGameStore(
        (state) => state.setPlayerError,
    );
    const correctAnswer = useGameStore((state) => state.correctAnswer);
    const isSubmittingGameInput = useGameStore(
        (state) => state.isSubmittingGameInput,
    );
    const gameInputErrorMessage = useGameStore(
        (state) => state.gameInputErrorMessage,
    );

    const { connectionStatus, canSubmitGameInput, submitGameInput } =
        useGameSocket(validInviteCode);

    const hasCurrentGameState = gameInviteCode === validInviteCode;
    const rankingEntries: readonly GameRankingEntry[] =
        hasCurrentGameState && rankings
            ? rankings.map((ranking) => ({
                rank: ranking.rank,
                nickname: ranking.nickname,
                score: ranking.score,
                isCurrentUser:
                    ranking.userIdentifier === userIdentifier,
            }))
            : [];
    const displayedChatMessages: readonly GameChatDisplayMessage[] =
        hasCurrentGameState
            ? chatMessages.map((message) => ({
                type: message.type,
                nickname: message.sender?.trim() || null,
                time: formatGameChatTime(message.timestamp),
                content: message.content,
            }))
            : [];
    const activeRoundReady =
        hasCurrentGameState &&
        roundReady?.roundNo === currentRoundNo
            ? roundReady
            : null;
    const isRoundFinished =
        activeRoundReady != null &&
        (roundEnd != null ||
            roundSkipped?.roundNo === activeRoundReady.roundNo);
    const shouldPlay =
        activeRoundReady != null &&
        !isRoundFinished &&
        playbackStarted?.roundNo === activeRoundReady.roundNo;
    const gameInputStatus = (() => {
        if (gameInputErrorMessage) {
            return {
                message: gameInputErrorMessage,
                tone: 'error' as const,
            };
        }

        if (
            hasCurrentGameState &&
            correctAnswer &&
            correctAnswer.roundNo === currentRoundNo
        ) {
            return {
                message: correctAnswer.isFuzzy
                    ? GAME_COPY.GAME_INPUT_FUZZY_CORRECT
                    : GAME_COPY.GAME_INPUT_CORRECT,
                tone: 'success' as const,
            };
        }

        if (connectionStatus !== 'connected') {
            return {
                message: GAME_COPY.GAME_INPUT_CONNECTING,
                tone: 'default' as const,
            };
        }

        if (!hasCurrentGameState || currentRoundNo == null) {
            return {
                message: GAME_COPY.GAME_INPUT_WAITING,
                tone: 'default' as const,
            };
        }

        return {
            message: null,
            tone: 'default' as const,
        };
    })();

    const handleLeave = () => {
        navigate(LOBBY_ROUTES.LIST);
    };

    return (
        <div className="flex min-h-screen flex-col bg-[var(--monomat-page-bg)]">
            <GameHeader onLeave={handleLeave} />

            {inviteCodeError ? (
                <InGameStateCard onBack={handleLeave} />
            ) : (
                <main className="flex-1 px-4 pb-[64px] pt-[30px] sm:px-6 lg:px-8 min-[1280px]:px-[40px]">
                    <InGameLayout
                        ranking={
                            <GameRankingCard
                                entries={rankingEntries}
                            />
                        }
                        roundStatus={
                            <GameRoundStatusBar
                                remainingSeconds={null}
                                progressPercent={null}
                            />
                        }
                        player={
                            <GamePlayerPanel
                                currentRound={
                                    hasCurrentGameState &&
                                    currentRoundNo != null
                                        ? currentRoundNo
                                        : null
                                }
                                roundReady={activeRoundReady}
                                shouldPlay={shouldPlay}
                                isRoundFinished={isRoundFinished}
                                playerReady={playerReady}
                                playerBuffering={playerBuffering}
                                playerPlaying={playerPlaying}
                                playerErrorMessage={
                                    playerErrorMessage
                                }
                                onPlayerReady={markPlayerReady}
                                onPlayerBuffering={
                                    markPlayerBuffering
                                }
                                onPlayerPlaying={
                                    markPlayerPlaying
                                }
                                onPlayerEnded={markPlayerEnded}
                                onPlayerError={setPlayerError}
                            />
                        }
                        answerInput={
                            <GameUnifiedInput
                                disabled={!canSubmitGameInput}
                                isSubmitting={isSubmittingGameInput}
                                onSubmit={submitGameInput}
                                statusMessage={gameInputStatus.message}
                                statusTone={gameInputStatus.tone}
                            />
                        }
                        chat={
                            <GameChatPanel
                                messages={displayedChatMessages}
                            />
                        }
                    />
                </main>
            )}

            <div className="shrink-0 [&>footer]:h-[41px] [&>footer>div]:h-[39px] [&>footer>div]:min-h-0 [&>footer>div]:py-0">
                <LobbyFooter />
            </div>
        </div>
    );
}
