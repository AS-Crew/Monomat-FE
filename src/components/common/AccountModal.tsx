import {
    useCallback,
    useEffect,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';
import { Edit2, LockOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../api/apiError';
import {
    changeMyPassword,
    updateMyNickname,
} from '../../api/userApi';
import { GUEST_NICKNAME_POLICY } from '../../constants/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { MonomatInput } from './MonomatInput';

type AccountType = 'guest' | 'member';
type MessageTone = 'error' | 'success';

interface AccountModalProps {
    isOpen: boolean;
    accountType: AccountType;
    onClose: () => void;
}

interface AccountModalContentProps {
    accountType: AccountType;
    onClose: () => void;
}

interface FeedbackMessage {
    tone: MessageTone;
    text: string;
}

const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
    guest: '게스트',
    member: '정식 회원',
};

const MEMBER_NICKNAME_MAX_LENGTH = 50;

function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function getPasswordChangeErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.status >= 500) {
        return '비밀번호 변경에 실패했습니다.';
    }

    return getErrorMessage(error, '비밀번호 변경에 실패했습니다.');
}

function FeedbackBadge({ message }: { message: FeedbackMessage | null }) {
    if (!message) {
        return null;
    }

    const toneClassName = message.tone === 'success'
        ? 'bg-[var(--monomat-primary-light)] text-[var(--monomat-primary)]'
        : 'bg-[var(--monomat-danger-light)] text-[var(--monomat-danger)]';

    return (
        <p
            role={message.tone === 'error' ? 'alert' : 'status'}
            className={`flex h-6 min-w-0 flex-1 items-center justify-center rounded-[12px] px-2 text-center text-[10px] font-semibold leading-none ${toneClassName}`}
        >
            <span className="min-w-0 truncate">
                {message.text}
            </span>
        </p>
    );
}

function SectionTitle({
                          children,
                          message,
                      }: {
    children: ReactNode;
    message?: FeedbackMessage | null;
}) {
    return (
        <div className="mb-[17px] flex h-6 min-w-0 items-center gap-4 text-black">
            <div className="flex shrink-0 items-center gap-2">
                <Edit2 size={24} strokeWidth={1.9} />
                <p className="text-base font-semibold leading-6">
                    {children}
                </p>
            </div>
            <FeedbackBadge message={message ?? null} />
        </div>
    );
}

function AccountModalContent({
                                 accountType,
                                 onClose,
                             }: AccountModalContentProps) {
    const navigate = useNavigate();

    const nickname = useAuthStore((state) => state.nickname);
    const updateNickname = useAuthStore((state) => state.updateNickname);
    const clearSession = useAuthStore((state) => state.clearSession);

    const displayNickname = nickname?.trim() || 'Guest';
    const avatarText = displayNickname.charAt(0).toUpperCase() || 'G';

    const [nicknameInput, setNicknameInput] = useState(displayNickname);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [nicknameMessage, setNicknameMessage] =
        useState<FeedbackMessage | null>(null);
    const [passwordMessage, setPasswordMessage] =
        useState<FeedbackMessage | null>(null);
    const [isNicknameSubmitting, setIsNicknameSubmitting] = useState(false);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

    const isSubmitting = isNicknameSubmitting || isPasswordSubmitting;

    const handleClose = useCallback(() => {
        if (isSubmitting) {
            return;
        }

        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        onClose();
    }, [isSubmitting, onClose]);

    useEffect(() => {
        setNicknameInput(displayNickname);
        setNicknameMessage(null);
    }, [displayNickname]);

    useEffect(() => {
        if (isSubmitting) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose, isSubmitting]);

    const handleRegisterClick = () => {
        handleClose();
        navigate('/register');
    };

    const handleLogout = () => {
        clearSession();
        onClose();
        navigate('/');
    };

    const handleGuestNicknameSave = () => {
        const trimmedNickname = nicknameInput.trim();

        if (!trimmedNickname) {
            setNicknameMessage({
                tone: 'error',
                text: '닉네임을 입력해주세요.',
            });
            return;
        }

        if (trimmedNickname.length > GUEST_NICKNAME_POLICY.MAX_LENGTH) {
            setNicknameMessage({
                tone: 'error',
                text: `닉네임은 ${GUEST_NICKNAME_POLICY.MAX_LENGTH}자 이내로 입력해주세요.`,
            });
            return;
        }

        updateNickname(trimmedNickname);
        setNicknameMessage({
            tone: 'success',
            text: '닉네임이 변경되었습니다.',
        });
    };

    const handleNicknameSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isNicknameSubmitting) {
            return;
        }

        const trimmedNickname = nicknameInput.trim();

        if (!trimmedNickname) {
            setNicknameMessage({
                tone: 'error',
                text: '닉네임을 입력해주세요.',
            });
            return;
        }

        if (trimmedNickname === (nickname?.trim() ?? '')) {
            setNicknameMessage({
                tone: 'success',
                text: '현재 닉네임과 동일합니다.',
            });
            return;
        }

        try {
            setIsNicknameSubmitting(true);
            setNicknameMessage(null);

            const response = await updateMyNickname({
                username: trimmedNickname,
            });

            updateNickname(response.username);
            setNicknameMessage({
                tone: 'success',
                text: '닉네임이 변경되었습니다.',
            });
        } catch (error) {
            setNicknameMessage({
                tone: 'error',
                text: getErrorMessage(error, '닉네임 변경에 실패했습니다.'),
            });
        } finally {
            setIsNicknameSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isPasswordSubmitting) {
            return;
        }

        if (
            !currentPassword.trim() ||
            !newPassword.trim() ||
            !newPasswordConfirm.trim()
        ) {
            setPasswordMessage({
                tone: 'error',
                text: '비밀번호 정보를 모두 입력해주세요.',
            });
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            setPasswordMessage({
                tone: 'error',
                text: '새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.',
            });
            return;
        }

        try {
            setIsPasswordSubmitting(true);
            setPasswordMessage(null);

            await changeMyPassword({
                currentPassword,
                newPassword,
                newPasswordConfirm,
            });

            clearSession();
            onClose();
            navigate('/');
        } catch (error) {
            setPasswordMessage({
                tone: 'error',
                text: getPasswordChangeErrorMessage(error),
            });
            setIsPasswordSubmitting(false);
        }
    };

    if (accountType === 'guest') {
        return (
            <div
                className="relative w-[480px] max-w-[calc(100vw-32px)] rounded-2xl bg-white px-10 py-8 text-[var(--monomat-text-strong)] shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute right-6 top-6 text-3xl leading-none text-[var(--monomat-text-muted)] transition hover:text-[var(--monomat-text-strong)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="계정 모달 닫기"
                >
                    ×
                </button>

                <p
                    id="account-modal-title"
                    role="heading"
                    aria-level={2}
                    className="mb-10 text-center text-2xl font-bold text-black"
                >
                    내 계정
                </p>

                <section className="mb-8 flex items-center gap-5 rounded-lg bg-[var(--monomat-page-bg)] px-4 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7359D9] text-xl font-bold text-white">
                        {avatarText}
                    </div>

                    <div className="min-w-0 text-left">
                        <p className="truncate text-lg font-bold text-[var(--monomat-text-strong)]">
                            {displayNickname}
                        </p>
                        <p className="text-sm text-[var(--monomat-text-muted)]">
                            {ACCOUNT_TYPE_LABEL.guest}
                        </p>
                    </div>
                </section>

                <section className="mb-8 text-left">
                    <label
                        htmlFor="account-guest-nickname"
                        className="mb-3 block text-base font-bold text-[var(--monomat-text-strong)]"
                    >
                        닉네임 변경
                    </label>

                    <div className="flex gap-2">
                        <MonomatInput
                            id="account-guest-nickname"
                            type="text"
                            value={nicknameInput}
                            maxLength={GUEST_NICKNAME_POLICY.MAX_LENGTH}
                            onChange={(event) =>
                                setNicknameInput(event.target.value)
                            }
                            className="h-12 min-w-0 flex-1 rounded-lg border border-[color:var(--monomat-border-input)] px-4 text-base font-semibold text-[var(--monomat-text-strong)] outline-none transition focus:border-[color:var(--monomat-primary)]"
                        />

                        <button
                            type="button"
                            onClick={handleGuestNicknameSave}
                            className="h-12 rounded-lg bg-[var(--monomat-primary)] px-6 font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
                        >
                            저장
                        </button>
                    </div>

                    <div className="mt-2">
                        <FeedbackBadge message={nicknameMessage} />
                    </div>
                </section>

                <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="mx-auto block font-bold text-[var(--monomat-primary)] underline underline-offset-2 transition hover:text-[var(--monomat-primary-hover)]"
                >
                    회원가입
                </button>
            </div>
        );
    }

    return (
        <div
            className="relative flex h-[700px] w-[480px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl bg-white px-[29px] pb-[38px] pt-7 text-[var(--monomat-text-strong)] shadow-xl"
            onClick={(event) => event.stopPropagation()}
        >
            <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="absolute right-[29px] top-[29px] flex h-6 w-6 items-center justify-center text-[18px] leading-none text-[var(--monomat-text-muted)] transition hover:text-[var(--monomat-text-strong)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="계정 모달 닫기"
            >
                ×
            </button>

            <p
                id="account-modal-title"
                role="heading"
                aria-level={2}
                className="mb-9 h-[33px] text-center text-[22px] font-extrabold leading-[33px] text-black"
            >
                내 계정
            </p>

            <div className="flex flex-1 flex-col justify-center pb-[4px] pt-[24px]">
                <section className="mb-[18px] flex h-[77px] items-center rounded-lg bg-[var(--monomat-page-bg)] px-[25px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--monomat-primary)] text-xl font-extrabold leading-none text-white">
                        {avatarText}
                    </div>

                    <div className="ml-[21px] min-w-0 text-left">
                        <p className="truncate text-lg font-bold leading-[21px] text-black">
                            {displayNickname}
                        </p>
                        <p className="mt-0.5 text-xs font-medium leading-[17px] text-[var(--monomat-text-muted)]">
                            {ACCOUNT_TYPE_LABEL.member}
                        </p>
                    </div>
                </section>

                <form
                    className="text-left"
                    onSubmit={handleNicknameSubmit}
                >
                    <SectionTitle message={nicknameMessage}>
                        닉네임 변경
                    </SectionTitle>

                    <div className="flex gap-2">
                        <MonomatInput
                            id="account-member-nickname"
                            type="text"
                            value={nicknameInput}
                            maxLength={MEMBER_NICKNAME_MAX_LENGTH}
                            disabled={isNicknameSubmitting || isPasswordSubmitting}
                            preventEnterSubmit={false}
                            onChange={(event) => {
                                setNicknameInput(event.target.value);
                                setNicknameMessage(null);
                            }}
                            placeholder="변경할 닉네임을 입력하세요"
                            className="h-[46px] min-w-0 flex-1 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <button
                            type="submit"
                            disabled={isNicknameSubmitting || isPasswordSubmitting}
                            className="h-11 w-[69px] shrink-0 rounded-lg bg-[var(--monomat-primary)] text-[15px] font-bold leading-none text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                        >
                            {isNicknameSubmitting ? '저장중' : '저장'}
                        </button>
                    </div>

                </form>

                <div className="my-[7px] h-4 w-full">
                    <div className="relative top-[7px] h-px w-full bg-[var(--monomat-border-default)]" />
                </div>

                <form
                    className="text-left"
                    onSubmit={handlePasswordSubmit}
                >
                    <SectionTitle message={passwordMessage}>
                        비밀번호 변경
                    </SectionTitle>

                    <div className="flex flex-col gap-[17px]">
                        <MonomatInput
                            type="password"
                            value={currentPassword}
                            disabled={isNicknameSubmitting || isPasswordSubmitting}
                            preventEnterSubmit={false}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value);
                                setPasswordMessage(null);
                            }}
                            placeholder="현재 비밀번호를 입력하세요"
                            className="h-[46px] rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <MonomatInput
                            type="password"
                            value={newPassword}
                            disabled={isNicknameSubmitting || isPasswordSubmitting}
                            preventEnterSubmit={false}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                                setPasswordMessage(null);
                            }}
                            placeholder="새 비밀번호"
                            className="h-[46px] rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <MonomatInput
                            type="password"
                            value={newPasswordConfirm}
                            disabled={isNicknameSubmitting || isPasswordSubmitting}
                            preventEnterSubmit={false}
                            onChange={(event) => {
                                setNewPasswordConfirm(event.target.value);
                                setPasswordMessage(null);
                            }}
                            placeholder="새 비밀번호 확인"
                            className="h-[46px] rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isNicknameSubmitting || isPasswordSubmitting}
                        className="mt-[18px] h-11 w-full rounded-lg bg-[var(--monomat-primary)] text-[15px] font-bold leading-none text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                    >
                        {isPasswordSubmitting ? '변경 중...' : '비밀번호 변경'}
                    </button>

                </form>
            </div>

            <div className="h-4 w-full">
                <div className="relative top-[7px] h-px w-full bg-[var(--monomat-border-default)]" />
            </div>

            <button
                type="button"
                onClick={handleLogout}
                disabled={isSubmitting}
                className="mx-auto mt-[17px] flex h-5 items-center justify-center gap-2 text-sm font-semibold leading-[18px] text-[var(--monomat-danger)] transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <LockOpen size={16} strokeWidth={2} />
                <span>로그아웃</span>
            </button>
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
            onClick={onClose}
        >
            <AccountModalContent
                accountType={accountType}
                onClose={onClose}
            />
        </div>
    );
}
