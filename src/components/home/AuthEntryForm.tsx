import { useState } from 'react';

import { useGuestSession } from '../../hooks/useGuestSession';
import { useMemberLoginSession } from '../../hooks/useMemberLoginSession';
import { useRegisterSession } from '../../hooks/useRegisterSession';
import { AUTH_LABELS, AUTH_MESSAGES } from '../../constants/auth';
import { GuestForm } from './GuestForm';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export type AuthMode = 'member' | 'guest' | 'register';

interface AuthEntryFormProps {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
}

const ENTRY_MODES: Exclude<AuthMode, 'register'>[] = ['member', 'guest'];

const MODE_LABEL: Record<Exclude<AuthMode, 'register'>, string> = {
    member: AUTH_LABELS.MEMBER_LOGIN,
    guest: AUTH_LABELS.GUEST_LOGIN,
};

function FeedbackMessage({
    message,
    variant,
}: {
    message: string | null;
    variant: 'error' | 'success';
}) {
    if (!message) {
        return null;
    }

    const className = variant === 'error'
        ? 'mb-4 rounded-lg bg-[#FFEAEC] px-3 py-2 text-left text-[11px] font-medium leading-[15px] text-[#FD2B48]'
        : 'mb-4 rounded-lg bg-[var(--monomat-primary-light)] px-3 py-2 text-left text-[11px] font-medium leading-[15px] text-[var(--monomat-primary)]';

    return (
        <div role="alert" className={className}>
            {message}
        </div>
    );
}

function Divider() {
    return (
        <div className="my-[22px] flex h-5 items-center gap-1 text-xs text-[var(--monomat-text-muted)]">
            <span className="h-px flex-1 bg-[var(--monomat-border-default)]" />
            <span className="w-20 text-center">{AUTH_LABELS.OR}</span>
            <span className="h-px flex-1 bg-[var(--monomat-border-default)]" />
        </div>
    );
}

export function AuthEntryForm({
    mode,
    onModeChange,
}: AuthEntryFormProps) {
    const [loginId, setLoginId] = useState('');
    const [memberPassword, setMemberPassword] = useState('');
    const [guestNickname, setGuestNickname] = useState('');
    const [autoLogin, setAutoLogin] = useState(false);
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
    const [registerNickname, setRegisterNickname] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const guestSession = useGuestSession();
    const memberSession = useMemberLoginSession();
    const registerSession = useRegisterSession();

    const isMemberMode = mode === 'member';
    const isGuestMode = mode === 'guest';
    const activeErrorMessage = isMemberMode
        ? memberSession.errorMessage
        : guestSession.errorMessage;
    const isActiveSubmitting = isMemberMode
        ? memberSession.isSubmitting
        : guestSession.isSubmitting;

    const clearAllFeedback = () => {
        memberSession.clearErrorMessage();
        guestSession.clearErrorMessage();
        registerSession.clearErrorMessage();
        setSuccessMessage(null);
    };

    const handleModeChange = (nextMode: AuthMode) => {
        if (
            memberSession.isSubmitting ||
            guestSession.isSubmitting ||
            registerSession.isSubmitting ||
            nextMode === mode
        ) {
            return;
        }

        clearAllFeedback();
        onModeChange(nextMode);
    };

    const handleMemberSubmit = () => {
        setSuccessMessage(null);
        void memberSession.loginWithAccount(loginId, memberPassword);
    };

    const handleGuestSubmit = () => {
        setSuccessMessage(null);
        void guestSession.createGuestSession(guestNickname);
    };

    const handleRegisterSubmit = () => {
        void (async () => {
            const registeredLoginId = await registerSession.registerWithAccount({
                loginId,
                password: registerPassword,
                passwordConfirm: registerPasswordConfirm,
                nickname: registerNickname,
            });

            if (!registeredLoginId) {
                return;
            }

            setLoginId(registeredLoginId);
            setMemberPassword('');
            setRegisterPassword('');
            setRegisterPasswordConfirm('');
            setRegisterNickname('');
            memberSession.clearErrorMessage();
            guestSession.clearErrorMessage();
            setSuccessMessage(AUTH_MESSAGES.REGISTER_SUCCESS);
            onModeChange('member');
        })();
    };

    if (mode === 'register') {
        return (
            <RegisterForm
                loginId={loginId}
                password={registerPassword}
                passwordConfirm={registerPasswordConfirm}
                nickname={registerNickname}
                isSubmitting={registerSession.isSubmitting}
                errorMessage={registerSession.errorMessage}
                onLoginIdChange={(value) => {
                    registerSession.clearErrorMessage();
                    setLoginId(value);
                }}
                onPasswordChange={(value) => {
                    registerSession.clearErrorMessage();
                    setRegisterPassword(value);
                }}
                onPasswordConfirmChange={(value) => {
                    registerSession.clearErrorMessage();
                    setRegisterPasswordConfirm(value);
                }}
                onNicknameChange={(value) => {
                    registerSession.clearErrorMessage();
                    setRegisterNickname(value);
                }}
                onSubmit={handleRegisterSubmit}
                onLoginClick={() => handleModeChange('member')}
            />
        );
    }

    return (
        <div className="w-full max-w-[480px] min-w-0 rounded-2xl bg-[var(--monomat-surface)] px-5 pb-8 pt-8 text-[var(--monomat-text-strong)] shadow-[0_18px_42px_rgba(12,17,28,0.12)] sm:px-8 sm:pb-10 sm:pt-10 lg:px-10 lg:pb-12 lg:pt-11">
            <header className="mb-[22px] text-center">
                <h2 className="mb-2 break-keep text-2xl font-extrabold leading-9 !text-[var(--monomat-text-strong)] lg:leading-10">
                    {isMemberMode
                        ? AUTH_LABELS.LOGIN
                        : AUTH_LABELS.GUEST_LOGIN}
                </h2>

                <p className="break-keep text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
                    {AUTH_LABELS.WELCOME}
                </p>
            </header>

            <div
                role="tablist"
                aria-label="로그인 방식 선택"
                className="mb-6 grid min-h-11 grid-cols-2 rounded-[10px] bg-[var(--monomat-page-bg)] p-1"
            >
                {ENTRY_MODES.map((authMode) => {
                    const isSelected = mode === authMode;

                    return (
                        <button
                            key={authMode}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            disabled={isActiveSubmitting}
                            onClick={() => handleModeChange(authMode)}
                            className={`min-h-9 min-w-0 rounded-lg px-2 text-sm leading-5 transition disabled:cursor-not-allowed ${
                                isSelected
                                    ? 'bg-white font-semibold text-[var(--monomat-text-strong)] shadow-sm'
                                    : 'font-medium text-[var(--monomat-text-muted)] hover:text-[var(--monomat-text-strong)]'
                            }`}
                        >
                            {MODE_LABEL[authMode]}
                        </button>
                    );
                })}
            </div>

            <FeedbackMessage message={activeErrorMessage} variant="error" />
            <FeedbackMessage message={successMessage} variant="success" />

            {isMemberMode ? (
                <LoginForm
                    loginId={loginId}
                    password={memberPassword}
                    autoLogin={autoLogin}
                    isSubmitting={memberSession.isSubmitting}
                    onLoginIdChange={(value) => {
                        memberSession.clearErrorMessage();
                        setSuccessMessage(null);
                        setLoginId(value);
                    }}
                    onPasswordChange={(value) => {
                        memberSession.clearErrorMessage();
                        setSuccessMessage(null);
                        setMemberPassword(value);
                    }}
                    onAutoLoginChange={setAutoLogin}
                    onSubmit={handleMemberSubmit}
                />
            ) : null}

            {isGuestMode ? (
                <GuestForm
                    nickname={guestNickname}
                    isSubmitting={guestSession.isSubmitting}
                    onNicknameChange={(value) => {
                        guestSession.clearErrorMessage();
                        setSuccessMessage(null);
                        setGuestNickname(value);
                    }}
                    onSubmit={handleGuestSubmit}
                />
            ) : null}

            <Divider />

            <button
                type="button"
                disabled={isActiveSubmitting}
                onClick={() => handleModeChange(isMemberMode ? 'guest' : 'member')}
                className="min-h-12 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-white px-3 text-[15px] font-bold leading-5 text-[var(--monomat-text-strong)] transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isMemberMode
                    ? AUTH_LABELS.QUICK_GUEST_START
                    : AUTH_LABELS.LOGIN}
            </button>

            <footer className="mt-[22px] flex min-w-0 items-center justify-between gap-4 text-[13px]">
                <span className="min-w-0 break-keep text-[var(--monomat-text-muted)]">
                    {AUTH_LABELS.SIGNUP_HINT}
                </span>

                <button
                    type="button"
                    disabled={isActiveSubmitting}
                    onClick={() => handleModeChange('register')}
                    className="font-semibold text-[var(--monomat-primary)] transition hover:text-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {AUTH_LABELS.SIGNUP}
                </button>
            </footer>
        </div>
    );
}
