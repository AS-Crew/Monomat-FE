import {
    CREATE_LOBBY_POLICY,
    LOBBY_ROOM_COPY,
} from '../../constants/lobby';

interface LobbyMapInfoCardProps {
    questionCount: number;
    timeLimitSeconds: number;
    maxPlayers: number;
}

function getProgressPercent(value: number, min: number, max: number) {
    if (max <= min) {
        return 0;
    }

    const percent = ((value - min) / (max - min)) * 100;
    return Math.min(Math.max(percent, 0), 100);
}

function SettingRule({
    label,
    value,
    progress,
}: {
    label: string;
    value: string;
    progress: number;
}) {
    return (
        <div className="min-w-0">
            <p className="text-base font-semibold leading-5 text-[var(--monomat-text-strong)]">
                {label} : <span className="font-bold">{value}</span>
            </p>
            <div className="relative mt-[10px] h-[7px] rounded-[3px] border border-[color:var(--monomat-border-input)] bg-white">
                <span
                    className="absolute left-0 top-0 h-full rounded-[3px] bg-[var(--monomat-primary)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export function LobbyMapInfoCard({
    questionCount,
    timeLimitSeconds,
    maxPlayers,
}: LobbyMapInfoCardProps) {
    return (
        <section className="min-h-[123px] rounded-2xl bg-white px-[25px] py-5 text-left shadow-[0_4px_16px_rgba(0,0,0,0.16)]">
            <h2 className="!m-0 !text-lg !font-bold !leading-6 !text-[var(--monomat-text-strong)]">
                {LOBBY_ROOM_COPY.GAME_SETTING_TITLE}
            </h2>

            <div className="mt-[15px] grid gap-5 md:grid-cols-3 md:gap-[60px]">
                <SettingRule
                    label={LOBBY_ROOM_COPY.MAX_PLAYERS}
                    value={`${maxPlayers}명`}
                    progress={getProgressPercent(
                        maxPlayers,
                        CREATE_LOBBY_POLICY.MIN_PLAYERS,
                        CREATE_LOBBY_POLICY.MAX_PLAYERS,
                    )}
                />
                <SettingRule
                    label={LOBBY_ROOM_COPY.QUESTION_COUNT}
                    value={`${questionCount}`}
                    progress={getProgressPercent(
                        questionCount,
                        CREATE_LOBBY_POLICY.MIN_QUESTION_COUNT,
                        CREATE_LOBBY_POLICY.MAX_QUESTION_COUNT,
                    )}
                />
                <SettingRule
                    label={LOBBY_ROOM_COPY.TIME_LIMIT}
                    value={`${timeLimitSeconds}초`}
                    progress={getProgressPercent(
                        timeLimitSeconds,
                        CREATE_LOBBY_POLICY.MIN_TIME_LIMIT_SECONDS,
                        CREATE_LOBBY_POLICY.MAX_TIME_LIMIT_SECONDS,
                    )}
                />
            </div>
        </section>
    );
}
