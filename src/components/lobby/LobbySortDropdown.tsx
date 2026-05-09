import { useState } from 'react';
import type { LobbySortOption } from '../../utils/lobbySort';

export type { LobbySortOption } from '../../utils/lobbySort';

const SORT_LABELS: Record<LobbySortOption, string> = {
    LATEST: '최신순',
    MOST_PLAYERS: '인원 많은 순',
    MOST_EMPTY_SLOTS: '빈 자리 많은 순',
};

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
                className="min-w-36 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50"
            >
                {SORT_LABELS[value]} ▼
            </button>

            {isOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    {(Object.keys(SORT_LABELS) as LobbySortOption[]).map(
                        (option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                                    value === option
                                        ? 'font-semibold text-blue-500'
                                        : 'text-gray-600'
                                }`}
                            >
                                {SORT_LABELS[option]}
                            </button>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}