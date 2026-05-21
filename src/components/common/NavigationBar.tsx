import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateLobbyModal } from '../lobby/CreateLobbyModal';
import { InviteCodeJoinModal } from '../lobby/InviteCodeJoinModal';
import { useAuthStore } from '../../store/useAuthStore';
import { AccountModal } from './AccountModal';
import type { CreateLobbyResponse } from '../../types/lobby';

export function NavigationBar() {
    const navigate = useNavigate();

    const nickname = useAuthStore((state) => state.nickname);
    const isGuest = useAuthStore((state) => state.isGuest);

    const [isInviteCodeModalOpen, setIsInviteCodeModalOpen] = useState(false);
    const [isCreateLobbyModalOpen, setIsCreateLobbyModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const displayNickname = nickname ?? 'Guest';
    const avatarText = displayNickname.charAt(0).toUpperCase();

    const accountType = isGuest ? 'guest' : 'member';
    const canCreateMap = accountType === 'member';

    const handleLogoClick = () => {
        navigate('/lobbies');
    };

    const handleCreateMapClick = () => {
        alert('맵 만들기 기능은 정식 회원 전용 기능입니다.');
    };

    const handleCreateLobbyClick = () => {
        setIsCreateLobbyModalOpen(true);
    };

    const handleLobbyCreated = (response: CreateLobbyResponse) => {
        navigate(`/lobby/${response.inviteCode}`);
    };

    return (
        <>
            <header className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-9">
                <button
                    type="button"
                    onClick={handleLogoClick}
                    className="flex items-center gap-3"
                    aria-label="로비 목록으로 이동"
                >
                    <div className="h-10 w-10 rounded-lg bg-[#0B1E46]" />
                    <span className="text-2xl font-bold text-gray-800">
                        Monomat
                    </span>
                </button>

                <div className="flex items-center gap-4">
                    {canCreateMap && (
                        <button
                            type="button"
                            onClick={handleCreateMapClick}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        >
                            🗺️ 맵 만들기
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsInviteCodeModalOpen(true)}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                        ▣ 초대 코드 입장
                    </button>

                    <button
                        type="button"
                        onClick={handleCreateLobbyClick}
                        className="rounded-lg bg-[#0B1E46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#12306B]"
                    >
                        + 로비 만들기
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsAccountModalOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1E46] text-sm font-bold text-white"
                        aria-label="내 계정 열기"
                    >
                        {avatarText}
                    </button>
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
