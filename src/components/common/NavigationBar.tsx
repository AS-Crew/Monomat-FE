import { type KeyboardEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/useAuthStore';
import { AccountModal } from './AccountModal';

const INVITE_CODE_LENGTH = 6;

export function NavigationBar() {
    const navigate = useNavigate();

    const nickname = useAuthStore((state) => state.nickname);
    const isGuest = useAuthStore((state) => state.isGuest);

    const [inviteCode, setInviteCode] = useState('');
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const displayNickname = nickname ?? 'Guest';
    const avatarText = displayNickname.charAt(0).toUpperCase();

    const accountType = isGuest ? 'guest' : 'member';
    const canCreateMap = accountType === 'member';

    const handleLogoClick = () => {
        navigate('/lobbies');
    };

    const handleInviteCodeSubmit = () => {
        const normalizedInviteCode = inviteCode.trim();

        if (normalizedInviteCode.length !== INVITE_CODE_LENGTH) {
            alert(`${INVITE_CODE_LENGTH}자리 초대 코드를 입력해주세요.`);
            return;
        }

        navigate(`/lobby/${normalizedInviteCode}`);
    };

    const handleInviteCodeKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.nativeEvent.isComposing) {
            return;
        }

        if (event.key === 'Enter') {
            handleInviteCodeSubmit();
        }
    };

    const handleCreateMapClick = () => {
        alert('맵 만들기 기능은 정식 회원 전용 기능입니다.');
    };

    const handleCreateLobbyClick = () => {
        alert('로비 만들기 기능은 추후 로비 생성 기능과 연결합니다.');
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

                    <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2">
                        <span className="mr-2 text-sm text-gray-900">▣</span>

                        <input
                            type="text"
                            value={inviteCode}
                            maxLength={INVITE_CODE_LENGTH}
                            onChange={(event) =>
                                setInviteCode(event.target.value)
                            }
                            onKeyDown={handleInviteCodeKeyDown}
                            placeholder="초대 코드"
                            className="w-28 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                        />

                        <button
                            type="button"
                            onClick={handleInviteCodeSubmit}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 hover:bg-gray-200"
                        >
                            입장
                        </button>
                    </div>

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

            <AccountModal
                isOpen={isAccountModalOpen}
                accountType={accountType}
                onClose={() => setIsAccountModalOpen(false)}
            />
        </>
    );
}