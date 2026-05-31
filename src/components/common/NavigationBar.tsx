import { useState } from 'react';
import { Copy, Map, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { CreateLobbyModal } from '../lobby/CreateLobbyModal';
import { InviteCodeJoinModal } from '../lobby/InviteCodeJoinModal';
import {
    LOBBY_NAVIGATION_LABELS,
    LOBBY_ROUTES,
} from '../../constants/lobby';
import { useAuthStore } from '../../store/useAuthStore';
import { AccountModal } from './AccountModal';
import { MonomatLogo } from './MonomatLogo';
import type { CreateLobbyResponse } from '../../types/lobby';

export function NavigationBar() {
    const navigate = useNavigate();

    const nickname = useAuthStore((state) => state.nickname);
    const userType = useAuthStore((state) => state.userType);

    const [isInviteCodeModalOpen, setIsInviteCodeModalOpen] = useState(false);
    const [isCreateLobbyModalOpen, setIsCreateLobbyModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const displayNickname = nickname ?? 'Guest';
    const avatarText = displayNickname.charAt(0).toUpperCase();
    const avatarClassName = userType === 'GUEST'
        ? 'bg-[#7359D9]'
        : 'bg-[var(--monomat-primary)]';

    const accountType = userType === 'GUEST' ? 'guest' : 'member';
    const canCreateMap = userType === 'REGISTERED';
    const createMapRoute = LOBBY_ROUTES.CREATE_MAP;
    const canNavigateToCreateMap = createMapRoute != null;

    const handleLogoClick = () => {
        navigate(LOBBY_ROUTES.LIST);
    };

    const handleCreateMapClick = () => {
        if (createMapRoute) {
            navigate(createMapRoute);
        }
    };

    const handleCreateLobbyClick = () => {
        setIsCreateLobbyModalOpen(true);
    };

    const handleLobbyCreated = (response: CreateLobbyResponse) => {
        navigate(LOBBY_ROUTES.ROOM(response.inviteCode));
    };

    return (
        <>
            <header className="min-h-[75px] shrink-0 border border-[color:var(--monomat-border-default)] bg-white">
                <div className="mx-auto flex min-h-[75px] w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
                    <button
                        type="button"
                        onClick={handleLogoClick}
                        className="h-10 w-[190px] shrink-0"
                        aria-label={LOBBY_NAVIGATION_LABELS.LOGO_ARIA_LABEL}
                    >
                        <MonomatLogo />
                    </button>

                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3 lg:gap-[22px]">
                        {canCreateMap && (
                            <button
                                type="button"
                                onClick={handleCreateMapClick}
                                aria-disabled={!canNavigateToCreateMap}
                                title={
                                    canNavigateToCreateMap
                                        ? undefined
                                        : LOBBY_NAVIGATION_LABELS.CREATE_MAP_PENDING_TITLE
                                }
                                className="flex h-10 w-[130px] shrink-0 items-center justify-center gap-2 rounded-lg border border-[color:var(--monomat-border-input)] bg-white text-base font-bold leading-none text-black transition hover:bg-[var(--monomat-page-bg)]"
                            >
                                <Map size={17} strokeWidth={2.4} />
                                <span>
                                    {LOBBY_NAVIGATION_LABELS.CREATE_MAP}
                                </span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsInviteCodeModalOpen(true)}
                            className="flex h-10 w-[180px] max-w-full shrink-0 items-center rounded-lg border border-[color:var(--monomat-border-input)] bg-white text-base leading-none transition hover:bg-[var(--monomat-page-bg)]"
                        >
                            <Copy
                                className="ml-[13px] shrink-0 text-black"
                                size={18}
                                strokeWidth={2.2}
                            />
                            <span className="ml-[18px] min-w-0 truncate text-[var(--monomat-border-input)]">
                                {LOBBY_NAVIGATION_LABELS.INVITE_CODE}
                            </span>
                            <span className="ml-auto mr-[9px] flex h-[22px] w-9 shrink-0 items-center justify-center rounded-full bg-[var(--monomat-page-bg)] text-[11px] text-[var(--monomat-text-muted)]">
                                {LOBBY_NAVIGATION_LABELS.INVITE_CODE_JOIN}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateLobbyClick}
                            className="flex h-10 w-[120px] shrink-0 items-center justify-center gap-1 rounded-lg bg-[var(--monomat-primary)] text-base font-bold leading-none text-white transition hover:bg-[var(--monomat-primary-hover)]"
                        >
                            <Plus size={15} strokeWidth={2.8} />
                            <span>{LOBBY_NAVIGATION_LABELS.CREATE_LOBBY}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAccountModalOpen(true)}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-extrabold leading-none text-white ${avatarClassName}`}
                            aria-label={LOBBY_NAVIGATION_LABELS.ACCOUNT_ARIA_LABEL}
                        >
                            {avatarText}
                        </button>
                    </div>
                </div>
            </header>

            <InviteCodeJoinModal
                isOpen={isInviteCodeModalOpen}
                onClose={() => setIsInviteCodeModalOpen(false)}
            />

            <CreateLobbyModal
                isOpen={isCreateLobbyModalOpen}
                onClose={() => setIsCreateLobbyModalOpen(false)}
                onCreated={handleLobbyCreated}
            />

            <AccountModal
                isOpen={isAccountModalOpen}
                accountType={accountType}
                onClose={() => setIsAccountModalOpen(false)}
            />
        </>
    );
}
