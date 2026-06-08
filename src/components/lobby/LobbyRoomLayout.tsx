import type { ReactNode } from 'react';

interface LobbyRoomLayoutProps {
    backNavigation: ReactNode;
    topControls: ReactNode;
    titleCard: ReactNode;
    playersCard: ReactNode;
    settingsCard: ReactNode;
    actionSlot: ReactNode;
    chatSlot: ReactNode;
    feedbackSlot?: ReactNode;
}

export function LobbyRoomLayout({
    backNavigation,
    topControls,
    titleCard,
    playersCard,
    settingsCard,
    actionSlot,
    chatSlot,
    feedbackSlot,
}: LobbyRoomLayoutProps) {
    return (
        <div className="mx-auto w-full max-w-[1360px]">
            <div className="flex flex-col gap-3 md:min-h-9 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">{backNavigation}</div>
                <div className="flex shrink-0 items-center md:justify-end">
                    {topControls}
                </div>
            </div>

            {feedbackSlot && <div className="mt-4">{feedbackSlot}</div>}

            <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,890px)_460px] xl:gap-[10px]">
                <div className="flex min-w-0 flex-col gap-5">
                    {titleCard}
                    {playersCard}
                    {settingsCard}
                    {actionSlot}
                </div>

                <aside className="min-w-0">{chatSlot}</aside>
            </section>
        </div>
    );
}
