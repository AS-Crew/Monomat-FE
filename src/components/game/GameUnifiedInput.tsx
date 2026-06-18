import { useRef, useState } from 'react';
import { Send } from 'lucide-react';

import {
    GAME_COPY,
    GAME_INPUT_POLICY,
} from '../../constants/game';

interface GameUnifiedInputProps {
    disabled: boolean;
    isSubmitting: boolean;
    onSubmit: (content: string) => boolean;
    statusMessage: string | null;
    statusTone: 'default' | 'error' | 'success';
}

export function GameUnifiedInput({
    disabled,
    isSubmitting,
    onSubmit,
    statusMessage,
    statusTone,
}: GameUnifiedInputProps) {
    const [gameInput, setGameInput] = useState('');
    const isComposingRef = useRef(false);
    const submissionLockRef = useRef(false);
    const trimmedGameInput = gameInput.trim();
    const isOverMaxLength =
        trimmedGameInput.length >
        GAME_INPUT_POLICY.MAX_MESSAGE_LENGTH;
    const isSubmitDisabled =
        disabled ||
        isSubmitting ||
        !trimmedGameInput ||
        isOverMaxLength;

    const trySubmit = () => {
        if (
            isComposingRef.current ||
            submissionLockRef.current ||
            isSubmitDisabled ||
            !trimmedGameInput
        ) {
            return;
        }

        submissionLockRef.current = true;

        if (!onSubmit(trimmedGameInput)) {
            submissionLockRef.current = false;
            return;
        }

        setGameInput('');
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        trySubmit();
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();

        if (
            event.nativeEvent.isComposing ||
            isComposingRef.current
        ) {
            return;
        }

        trySubmit();
    };

    const displayedStatusMessage = isOverMaxLength
        ? GAME_COPY.GAME_INPUT_TOO_LONG
        : statusMessage;
    const displayedStatusTone = isOverMaxLength
        ? 'error'
        : statusTone;
    const statusClassName = {
        default:
            'left-1 text-[var(--monomat-text-muted)]',
        error:
            'left-0 right-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 shadow-sm',
        success:
            'left-0 right-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-700 shadow-sm',
    }[displayedStatusTone];

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex h-[52px] gap-[8px]"
        >
            <label className="sr-only" htmlFor="game-unified-input">
                {GAME_COPY.GAME_INPUT_PLACEHOLDER}
            </label>
            <input
                id="game-unified-input"
                type="text"
                value={gameInput}
                onChange={(event) => {
                    submissionLockRef.current = false;
                    setGameInput(event.target.value);
                }}
                onCompositionStart={() => {
                    isComposingRef.current = true;
                }}
                onCompositionEnd={() => {
                    isComposingRef.current = false;
                }}
                onKeyDown={handleKeyDown}
                placeholder={GAME_COPY.GAME_INPUT_PLACEHOLDER}
                disabled={disabled || isSubmitting}
                aria-describedby="game-unified-input-status"
                aria-invalid={isOverMaxLength}
                className="h-[52px] min-w-0 flex-1 rounded-xl border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-[14px] text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[var(--monomat-primary)]"
            />
            <button
                type="submit"
                disabled={isSubmitDisabled}
                aria-label={GAME_COPY.GAME_INPUT_ACTION_ARIA_LABEL}
                title={GAME_COPY.GAME_INPUT_ACTION_ARIA_LABEL}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[var(--monomat-primary)] text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Send
                    size={25}
                    strokeWidth={2}
                    className="-rotate-12"
                    aria-hidden="true"
                />
            </button>
            <p
                id="game-unified-input-status"
                role={displayedStatusTone === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`absolute top-[calc(100%+6px)] text-xs font-medium ${statusClassName}`}
            >
                {displayedStatusMessage}
            </p>
        </form>
    );
}
