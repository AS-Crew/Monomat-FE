const AVATAR_COLOR_PALETTE = [
    '#7359D9',
    '#3873E6',
    '#16A34A',
    '#F97316',
    '#DC2626',
    '#9333EA',
    '#0891B2',
    '#BE185D',
    '#4F46E5',
    '#0F766E',
] as const;

const DEFAULT_AVATAR_COLOR_SEED = 'monomat-user';

function createHashSeed(value: string): number {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }

    return hash;
}

export function getAvatarColor(seed: string | null | undefined): string {
    const normalizedSeed = seed?.trim() || DEFAULT_AVATAR_COLOR_SEED;
    const hash = createHashSeed(normalizedSeed);

    return AVATAR_COLOR_PALETTE[hash % AVATAR_COLOR_PALETTE.length];
}
