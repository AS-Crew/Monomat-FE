import type { Lobby } from '../../types/lobby';
import { LobbyCard } from './LobbyCard';
import { LobbyEmptyState } from './LobbyEmptyState';

interface LobbyListProps {
    lobbies: Lobby[];
    onEnter: (code: string) => void;
}

export function LobbyList({ lobbies, onEnter }: LobbyListProps) {
    if (lobbies.length === 0) {
        return <LobbyEmptyState />;
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {lobbies.map((lobby) => (
                <LobbyCard
                    key={lobby.code}
                    lobby={lobby}
                    onEnter={onEnter}
                />
            ))}
        </div>
    );
}