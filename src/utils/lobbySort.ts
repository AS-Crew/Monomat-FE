import type { Lobby } from '../types/lobby';

export type LobbySortOption =
    | 'LATEST'
    | 'MOST_PLAYERS'
    | 'MOST_EMPTY_SLOTS';

export function getCurrentPlayers(lobby: Lobby): number {
    return lobby.currentPlayers;
}

export function sortLobbies(
    lobbies: Lobby[],
    sortOption: LobbySortOption,
): Lobby[] {
    const copiedLobbies = [...lobbies];

    switch (sortOption) {
        case 'MOST_PLAYERS':
            return copiedLobbies.sort(
                (left, right) =>
                    getCurrentPlayers(right) - getCurrentPlayers(left),
            );

        case 'MOST_EMPTY_SLOTS':
            return copiedLobbies.sort((left, right) => {
                const rightEmptySlots =
                    right.maxPlayers - getCurrentPlayers(right);
                const leftEmptySlots =
                    left.maxPlayers - getCurrentPlayers(left);

                return rightEmptySlots - leftEmptySlots;
            });

        case 'LATEST':
        default:
            return copiedLobbies;
    }
}