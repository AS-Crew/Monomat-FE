import type { ReactNode } from 'react';

interface InGameLayoutProps {
    ranking: ReactNode;
    roundStatus: ReactNode;
    player: ReactNode;
    answerInput: ReactNode;
    chat: ReactNode;
}

export function InGameLayout({
    ranking,
    roundStatus,
    player,
    answerInput,
    chat,
}: InGameLayoutProps) {
    return (
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[220px_minmax(0,1fr)] gap-[16px] min-[1280px]:grid-cols-[250px_minmax(0,700px)_minmax(320px,377px)]">
            <aside className="min-w-0">{ranking}</aside>

            <div className="flex min-w-0 flex-col gap-[15px]">
                {roundStatus}
                {player}
                {answerInput}
            </div>

            <aside className="col-span-2 min-w-0 min-[1280px]:col-span-1">
                {chat}
            </aside>
        </div>
    );
}
