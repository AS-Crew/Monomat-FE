import { useNavigate, useParams } from 'react-router-dom';

import { GameAnswerInput } from '../components/game/GameAnswerInput';
import { GameChatPanel } from '../components/game/GameChatPanel';
import { GameHeader } from '../components/game/GameHeader';
import { GamePlayerPanel } from '../components/game/GamePlayerPanel';
import { GameRankingCard } from '../components/game/GameRankingCard';
import { GameRoundStatusBar } from '../components/game/GameRoundStatusBar';
import { InGameLayout } from '../components/game/InGameLayout';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import {
    GAME_CHAT_PREVIEW,
    GAME_COPY,
    GAME_PREVIEW,
    GAME_RANKING_PREVIEW,
} from '../constants/game';
import { LOBBY_ROUTES } from '../constants/lobby';
import {
    normalizeInviteCode,
    validateInviteCode,
} from '../utils/inviteCode';

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
                                entries={GAME_RANKING_PREVIEW}
                            />
                        }
                        roundStatus={
                            <GameRoundStatusBar
                                remainingSeconds={
                                    GAME_PREVIEW.remainingSeconds
                                }
                                progressPercent={
                                    GAME_PREVIEW.timeProgressPercent
                                }
                            />
                        }
                        player={
                            <GamePlayerPanel
                                currentRound={GAME_PREVIEW.currentRound}
                                totalRounds={GAME_PREVIEW.totalRounds}
                            />
                        }
                        answerInput={<GameAnswerInput />}
                        chat={
                            <GameChatPanel messages={GAME_CHAT_PREVIEW} />
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
