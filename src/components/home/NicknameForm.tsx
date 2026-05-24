import { useState, type FormEvent, type KeyboardEvent } from 'react';

import { useGuestSession } from '../../hooks/useGuestSession';
import { useMemberLoginSession } from '../../hooks/useMemberLoginSession';
import {
    AUTH_LABELS,
    GUEST_NICKNAME_POLICY,
    GUEST_NICKNAME_GUIDE,
} from '../../constants/auth';

export type AuthMode = 'member' | 'guest';

interface NicknameFormProps {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
}

const AUTH_MODES: AuthMode[] = ['member', 'guest'];

const MODE_LABEL: Record<AuthMode, string> = {
    member: AUTH_LABELS.MEMBER_LOGIN,
    guest: AUTH_LABELS.GUEST_LOGIN,
};

function ErrorMessage({ message }: { message: string | null }) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="alert"
            className="mb-4 rounded-lg bg-[#FFEAEC] px-3 py-2 text-left text-[11px] font-medium leading-[15px] text-[#FD2B48]"
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

export function NicknameForm({
    mode,
    onModeChange,
}: NicknameFormProps) {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [autoLogin, setAutoLogin] = useState(false);

    const guestSession = useGuestSession();
    const memberSession = useMemberLoginSession();

    const isMemberMode = mode === 'member';
    const activeErrorMessage = isMemberMode
        ? memberSession.errorMessage
        : guestSession.errorMessage;
    const isActiveSubmitting = isMemberMode
        ? memberSession.isSubmitting
        : guestSession.isSubmitting;

    const handleModeChange = (nextMode: AuthMode) => {
        if (isActiveSubmitting || nextMode === mode) {
            return;
        }

        memberSession.clearErrorMessage();
        guestSession.clearErrorMessage();
        onModeChange(nextMode);
    };

    const handleMemberSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void memberSession.loginWithAccount(loginId, password);
    };

    const handleGuestSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void guestSession.createGuestSession(nickname);
    };

    const handleMemberEnter = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.nativeEvent.isComposing || event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        void memberSession.loginWithAccount(loginId, password);
    };

    const handleGuestEnter = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.nativeEvent.isComposing || event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        void guestSession.createGuestSession(nickname);
    };

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
                {AUTH_MODES.map((authMode) => {
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

            <ErrorMessage message={activeErrorMessage} />

            {isMemberMode ? (
                <form onSubmit={handleMemberSubmit} className="min-w-0 text-left">
                    <label
                        htmlFor="login-id"
                        className="mb-2 block text-xs font-semibold text-[var(--monomat-text-muted)]"
                    >
                        {AUTH_LABELS.LOGIN_ID}
                    </label>
                    <input
                        id="login-id"
                        type="text"
                        value={loginId}
                        autoFocus
                        disabled={memberSession.isSubmitting}
                        placeholder={AUTH_LABELS.LOGIN_ID_PLACEHOLDER}
                        onChange={(event) => {
                            memberSession.clearErrorMessage();
                            setLoginId(event.target.value);
                        }}
                        onKeyDown={handleMemberEnter}
                        className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-4 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <label
                        htmlFor="login-password"
                        className="mb-2 mt-[22px] block text-xs font-semibold text-[var(--monomat-text-muted)]"
                    >
                        {AUTH_LABELS.PASSWORD}
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        disabled={memberSession.isSubmitting}
                        placeholder={AUTH_LABELS.PASSWORD_PLACEHOLDER}
                        onChange={(event) => {
                            memberSession.clearErrorMessage();
                            setPassword(event.target.value);
                        }}
                        onKeyDown={handleMemberEnter}
                        className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-4 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <label className="mt-[18px] flex h-5 items-center gap-2 text-[13px] font-medium text-[var(--monomat-text-muted)]">
                        <input
                            type="checkbox"
                            checked={autoLogin}
                            disabled={memberSession.isSubmitting}
                            onChange={(event) => {
                                setAutoLogin(event.target.checked);
                            }}
                            className="h-4 w-4 rounded border-[color:var(--monomat-border-input)] accent-[var(--monomat-primary)] disabled:cursor-not-allowed"
                        />
                        {AUTH_LABELS.AUTO_LOGIN}
                    </label>

                    <button
                        type="submit"
                        disabled={memberSession.isSubmitting}
                        className="mt-[22px] min-h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                    >
                        {memberSession.isSubmitting
                            ? AUTH_LABELS.LOGIN_SUBMITTING
                            : AUTH_LABELS.LOGIN}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleGuestSubmit} className="min-w-0 text-left">
                    <label
                        htmlFor="guest-nickname"
                        className="mb-2 block text-xs font-semibold text-[var(--monomat-text-muted)]"
                    >
                        {AUTH_LABELS.NICKNAME}
                    </label>
                    <input
                        id="guest-nickname"
                        type="text"
                        value={nickname}
                        maxLength={GUEST_NICKNAME_POLICY.MAX_LENGTH}
                        autoFocus
                        disabled={guestSession.isSubmitting}
                        placeholder={AUTH_LABELS.NICKNAME_PLACEHOLDER}
                        onChange={(event) => {
                            guestSession.clearErrorMessage();
                            setNickname(event.target.value);
                        }}
                        onKeyDown={handleGuestEnter}
                        className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-4 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <ul className="mt-5 space-y-[6px] text-[13px] leading-5 text-[var(--monomat-text-muted)]">
                        {GUEST_NICKNAME_GUIDE.map((guide) => (
                            <li key={guide} className="break-keep">
                                • {guide}
                            </li>
                        ))}
                    </ul>

                    <button
                        type="submit"
                        disabled={guestSession.isSubmitting}
                        className="mt-8 min-h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                    >
                        {guestSession.isSubmitting
                            ? AUTH_LABELS.SUBMITTING
                            : AUTH_LABELS.SUBMIT}
                    </button>
                </form>
            )}

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
                    disabled
                    className="font-semibold text-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-80"
                >
                    {AUTH_LABELS.SIGNUP}
                </button>
            </footer>
        </div>
    );
}
