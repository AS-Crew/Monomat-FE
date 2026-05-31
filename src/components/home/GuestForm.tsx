import { type FormEvent } from 'react';

import {
    AUTH_LABELS,
    GUEST_NICKNAME_GUIDE,
    GUEST_NICKNAME_POLICY,
} from '../../constants/auth';
import { AuthFieldHeader } from './AuthErrorMessage';

interface GuestFormProps {
    nickname: string;
    isSubmitting: boolean;
    errorMessage: string | null;
    errorField: string | null;
    onNicknameChange: (value: string) => void;
    onSubmit: () => void;
}

export function GuestForm({
    nickname,
    isSubmitting,
    errorMessage,
    errorField,
    onNicknameChange,
    onSubmit,
}: GuestFormProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };
    const nicknameError = errorField === 'nickname' ? errorMessage : null;

    return (
        <form onSubmit={handleSubmit} className="min-w-0 text-left">
            <AuthFieldHeader
                htmlFor="guest-nickname"
                label={AUTH_LABELS.NICKNAME}
                errorMessage={nicknameError}
            />
            <input
                id="guest-nickname"
                type="text"
                value={nickname}
                maxLength={GUEST_NICKNAME_POLICY.MAX_LENGTH}
                autoFocus
                disabled={isSubmitting}
                placeholder={AUTH_LABELS.NICKNAME_PLACEHOLDER}
                onChange={(event) => onNicknameChange(event.target.value)}
                className="h-11 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <ul className="mt-10 space-y-[11px] text-[13px] leading-4 text-[var(--monomat-text-muted)]">
                {GUEST_NICKNAME_GUIDE.map((guide) => (
                    <li key={guide} className="break-keep">
                        {guide}
                    </li>
                ))}
            </ul>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-[30px] min-h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
            >
                {isSubmitting
                    ? AUTH_LABELS.SUBMITTING
                    : AUTH_LABELS.SUBMIT}
            </button>
        </form>
    );
}
