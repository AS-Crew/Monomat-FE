import { useState } from 'react';

import { useGuestSession } from '../../hooks/useGuestSession';
import { useMemberLoginSession } from '../../hooks/useMemberLoginSession';
import { useRegisterSession } from '../../hooks/useRegisterSession';
import { AUTH_LABELS, AUTH_MESSAGES } from '../../constants/auth';
import { AuthGlobalErrorMessage } from './AuthErrorMessage';
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

function SuccessMessage({
    message,
}: {
    message: string | null;
}) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="status"
            className="mb-4 rounded-lg bg-[var(--monomat-primary-light)] px-3 py-2 text-left text-[11px] font-medium leading-[15px] text-[var(--monomat-primary)]"
        >
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
    const activeErrorField = isMemberMode
        ? memberSession.errorField
        : guestSession.errorField;
    const activeGlobalErrorMessage = activeErrorField
        ? null
        : activeErrorMessage;
    const isActiveSubmitting = isMemberMode
        ? memberSession.isSubmitting
        : guestSession.isSubmitting;
    const hasTopFeedback = Boolean(activeGlobalErrorMessage || successMessage);

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
                errorField={registerSession.errorField}
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
        <div className="w-full max-w-[480px] min-w-0 rounded-2xl bg-[var(--monomat-surface)] px-5 py-8 text-[var(--monomat-text-strong)] shadow-[0_4px_24px_rgba(0,0,0,0.18)] sm:min-h-[690px] sm:px-[30px] sm:pb-[57px] sm:pt-14">
            <header className="mb-[24px] text-center">
                <h2 className="mb-[21px] break-keep text-2xl font-extrabold leading-7 !text-black">
                    {isMemberMode
                        ? AUTH_LABELS.LOGIN
                        : AUTH_LABELS.GUEST_LOGIN}
                </h2>

                <p className="break-keep text-sm font-medium leading-[17px] text-[var(--monomat-text-muted)]">
                    {AUTH_LABELS.WELCOME}
                </p>
            </header>

            <div
                role="tablist"
                aria-label="로그인 방식 선택"
                className={`grid min-h-[45px] grid-cols-2 rounded-lg bg-[var(--monomat-page-bg)] p-[5px] ${
                    hasTopFeedback ? 'mb-[19px]' : 'mb-[43px]'
                }`}
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
                                    ? 'bg-white font-semibold text-black shadow-[0_1px_4px_rgba(0,0,0,0.22)]'
                                    : 'font-semibold text-[var(--monomat-text-muted)] hover:text-[var(--monomat-text-strong)]'
                            }`}
                        >
                            {MODE_LABEL[authMode]}
                        </button>
                    );
                })}
            </div>

            <AuthGlobalErrorMessage
                message={activeGlobalErrorMessage}
                className="mb-[19px]"
            />
            <SuccessMessage message={successMessage} />

            {isMemberMode ? (
                <LoginForm
                    loginId={loginId}
                    password={memberPassword}
                    autoLogin={autoLogin}
                    isSubmitting={memberSession.isSubmitting}
                    errorMessage={memberSession.errorMessage}
                    errorField={memberSession.errorField}
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
                    errorMessage={guestSession.errorMessage}
                    errorField={guestSession.errorField}
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
