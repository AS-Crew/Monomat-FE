import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/useAuthStore';

type AccountType = 'guest' | 'member';

interface AccountModalProps {
    isOpen: boolean;
    accountType: AccountType;
    onClose: () => void;
}

interface AccountModalContentProps {
    accountType: AccountType;
    onClose: () => void;
}

const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
    guest: '게스트',
    member: '정식 회원',
};

const NICKNAME_MAX_LENGTH = 12;
const PASSWORD_MIN_LENGTH = 6;

function AccountModalContent({
                                 accountType,
                                 onClose,
                             }: AccountModalContentProps) {
    const navigate = useNavigate();

    const nickname = useAuthStore((state) => state.nickname);
    const updateNickname = useAuthStore((state) => state.updateNickname);
    const clearSession = useAuthStore((state) => state.clearSession);

    const [nicknameInput, setNicknameInput] = useState(nickname ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

    const displayNickname = nickname ?? 'Guest';
    const avatarText = displayNickname.charAt(0).toUpperCase();

    const handleNicknameSave = () => {
        const trimmedNickname = nicknameInput.trim();

        if (!trimmedNickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        if (trimmedNickname.length > NICKNAME_MAX_LENGTH) {
            alert(`닉네임은 ${NICKNAME_MAX_LENGTH}자 이내로 입력해주세요.`);
            return;
        }

        updateNickname(trimmedNickname);
    };

    const handleRegisterClick = () => {
        onClose();
        navigate('/register');
    };

    const handleLogout = () => {
        clearSession();
        onClose();
        navigate('/');
    };

    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            alert('비밀번호 정보를 모두 입력해주세요.');
            return;
        }

        if (newPassword.length < PASSWORD_MIN_LENGTH) {
            alert(`새 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`);
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            alert('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        alert('비밀번호 변경 API 연동 후 처리할 기능입니다.');
    };

    return (
        <div
            className={`relative w-[480px] rounded-2xl bg-white px-10 py-8 text-[#333338] shadow-xl ${
                accountType === 'member' ? 'min-h-[690px]' : 'min-h-[375px]'
            }`}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-6 top-6 text-3xl leading-none text-[#808085] hover:text-[#333338]"
                aria-label="계정 모달 닫기"
            >
                ×
            </button>

            <h2
                id="account-modal-title"
                className="mb-10 text-center text-2xl font-bold text-[#333338]"
            >
                내 계정
            </h2>

            <section className="mb-8 flex items-center gap-5 rounded-lg bg-[#F5F5F7] px-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3873E6] text-xl font-bold text-white">
                    {avatarText}
                </div>

                <div>
                    <p className="text-lg font-bold text-[#333338]">
                        {displayNickname}
                    </p>
                    <p className="text-sm text-[#B9B9B9]">
                        {ACCOUNT_TYPE_LABEL[accountType]}
                    </p>
                </div>
            </section>

            <section className="mb-8">
                <label
                    htmlFor="account-nickname"
                    className="mb-3 block text-base font-bold text-[#333338]"
                >
                    📝 닉네임 변경
                </label>

                <div className="flex gap-2">
                    <input
                        id="account-nickname"
                        type="text"
                        value={nicknameInput}
                        maxLength={NICKNAME_MAX_LENGTH}
                        onChange={(event) =>
                            setNicknameInput(event.target.value)
                        }
                        className="h-12 flex-1 rounded-lg border border-[#CCCCD1] px-4 text-base font-semibold text-[#333338] outline-none focus:border-[#3873E6]"
                    />

                    <button
                        type="button"
                        onClick={handleNicknameSave}
                        className="h-12 rounded-lg bg-[#3873E6] px-6 font-bold text-white hover:bg-blue-600"
                    >
                        저장
                    </button>
                </div>
            </section>

            {accountType === 'member' ? (
                <>
                    <section className="mb-8 border-t border-[#E0E0E6] pt-6">
                        <p className="mb-5 text-base font-bold text-[#333338]">
                            🔑 비밀번호 변경
                        </p>

                        <div className="flex flex-col gap-4">
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                placeholder="현재 비밀번호"
                                className="h-12 rounded-lg border border-[#CCCCD1] px-4 text-[#333338] outline-none placeholder:text-[#CCCCD1] focus:border-[#3873E6]"
                            />

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                placeholder="새 비밀번호 (6자 이상)"
                                className="h-12 rounded-lg border border-[#CCCCD1] px-4 text-[#333338] outline-none placeholder:text-[#CCCCD1] focus:border-[#3873E6]"
                            />

                            <input
                                type="password"
                                value={newPasswordConfirm}
                                onChange={(event) =>
                                    setNewPasswordConfirm(event.target.value)
                                }
                                placeholder="새 비밀번호 확인"
                                className="h-12 rounded-lg border border-[#CCCCD1] px-4 text-[#333338] outline-none placeholder:text-[#CCCCD1] focus:border-[#3873E6]"
                            />

                            <button
                                type="button"
                                onClick={handlePasswordChange}
                                className="h-12 rounded-lg border border-[#CCCCD1] font-bold text-[#333338] hover:bg-[#F5F5F7]"
                            >
                                🔑 비밀번호 변경
                            </button>
                        </div>
                    </section>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="h-12 w-full rounded-lg bg-red-50 font-bold text-red-600 hover:bg-red-100"
                    >
                        로그아웃
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="mx-auto block font-bold text-[#3873E6] underline underline-offset-2"
                >
                    회원가입
                </button>
            )}
        </div>
    );
}

export function AccountModal({
                                 isOpen,
                                 accountType,
                                 onClose,
                             }: AccountModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-modal-title"
        >
            <AccountModalContent
                accountType={accountType}
                onClose={onClose}
            />
        </div>
    );
}