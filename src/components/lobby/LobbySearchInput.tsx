import { Search } from 'lucide-react';

import { LOBBY_SEARCH_COPY } from '../../constants/lobby';

interface LobbySearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function LobbySearchInput({
                                     value,
                                     onChange,
                                 }: LobbySearchInputProps) {
    return (
        <label className="flex h-11 w-[728px] items-center rounded-[10px] border border-[color:var(--monomat-border-input)] bg-white">
            <Search
                className="ml-[11px] shrink-0 text-[#2B3F6C]"
                size={24}
                strokeWidth={1.6}
                aria-hidden="true"
            />
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={LOBBY_SEARCH_COPY.PLACEHOLDER}
                className="h-full min-w-0 flex-1 bg-transparent px-[11px] text-sm leading-none text-[var(--monomat-text-strong)] outline-none placeholder:text-[var(--monomat-border-input)]"
            />
        </label>
    );
}
