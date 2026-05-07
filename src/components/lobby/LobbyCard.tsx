import type { Lobby, LobbyCategory } from '../../types/lobby';

interface LobbyCardProps {
    lobby: Lobby;
    onEnter: (code: string) => void;
}

function StatusBadge({ status }: { status: Lobby['status'] }) {
    const isWaiting = status === 'WAITING';

    return (
        <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isWaiting
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
            }`}
        >
            ● {isWaiting ? '대기중' : '진행중'}
        </span>
    );
}

function CategoryBadge({ category }: { category: LobbyCategory | null | undefined }) {
    if (!category) {
        return null;
    }

    return (
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-500">
            {category}
        </span>
    );
}

function ProgressBar({
                         current,
                         max,
                         status,
                     }: {
    current: number;
    max: number;
    status: Lobby['status'];
}) {
    const percent = Math.round((current / max) * 100);
    const isFull = current >= max;
    const color =
        status === 'PLAYING'
            ? 'bg-yellow-400'
            : isFull
                ? 'bg-blue-500'
                : 'bg-blue-400';

    return (
        <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
                className={`h-1.5 rounded-full ${color}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

export function LobbyCard({ lobby, onEnter }: LobbyCardProps) {
    const {
        code,
        title,
        status,
        maxPlayers,
        category,
    } = lobby;

    const currentPlayers = 1;
    const isFull = currentPlayers >= maxPlayers;
    const isEnterDisabled = isFull || status === 'PLAYING';

    return (
        <div className="flex flex-col justify-between rounded-xl bg-white p-5 text-left shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <StatusBadge status={status} />
                <CategoryBadge category={category} />
            </div>

            <p className="mb-4 text-left text-base font-semibold text-gray-900">
                {title}
            </p>

            <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                <span>👤 host</span>
                <span>{currentPlayers}/{maxPlayers}명</span>
            </div>

            <ProgressBar
                current={currentPlayers}
                max={maxPlayers}
                status={status}
            />

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={() => onEnter(code)}
                    disabled={isEnterDisabled}
                    className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition ${
                        isEnterDisabled
                            ? 'cursor-not-allowed bg-gray-300'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isEnterDisabled ? '입장불가' : '입장'}
                </button>
            </div>
        </div>
    );
}