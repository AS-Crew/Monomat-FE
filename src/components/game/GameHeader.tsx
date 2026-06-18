import { X } from 'lucide-react';

import { GAME_COPY } from '../../constants/game';
import { MonomatLogo } from '../common/MonomatLogo';

interface GameHeaderProps {
    onLeave: () => void;
}

export function GameHeader({ onLeave }: GameHeaderProps) {
    return (
        <header className="h-[75px] shrink-0 border border-[color:var(--monomat-border-default)] bg-white">
            <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 min-[1280px]:px-[40px]">
                <MonomatLogo />

                <button
                    type="button"
                    onClick={onLeave}
                    aria-label={GAME_COPY.LEAVE_ARIA_LABEL}
                    className="flex h-10 items-center gap-1 text-lg font-medium text-[var(--monomat-text-muted)] transition hover:text-[var(--monomat-text-strong)]"
                >
                    <X size={22} strokeWidth={2} aria-hidden="true" />
                    <span>{GAME_COPY.LEAVE}</span>
                </button>
            </div>
        </header>
    );
}
