import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { LOBBY_SORT_LABELS } from '../../constants/lobby';

import type { LobbySortOption } from '../../types/lobby';

export type { LobbySortOption } from '../../types/lobby';

interface LobbySortDropdownProps {
    value: LobbySortOption;
    onChange: (value: LobbySortOption) => void;
}

export function LobbySortDropdown({
                                      value,
                                      onChange,
                                  }: LobbySortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (nextValue: LobbySortOption) => {
        onChange(nextValue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-11 w-[161px] items-center justify-center rounded-lg border border-[color:var(--monomat-border-input)] bg-white text-base font-normal leading-none text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)]"
            >
                <span>정렬: {LOBBY_SORT_LABELS[value]}</span>
                <ChevronDown
                    className="ml-2"
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-20 mt-2 w-[188px] overflow-hidden rounded-lg border border-[color:var(--monomat-border-input)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    {(Object.keys(LOBBY_SORT_LABELS) as LobbySortOption[]).map(
                        (option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`block h-10 w-full px-4 text-left text-sm transition hover:bg-[var(--monomat-page-bg)] ${
                                    value === option
                                        ? 'font-semibold text-[var(--monomat-primary)]'
                                        : 'font-normal text-[var(--monomat-text-muted)]'
                                }`}
                            >
                                {LOBBY_SORT_LABELS[option]}
                            </button>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
