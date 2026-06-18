import { useState } from 'react';
import { Send } from 'lucide-react';

import { GAME_COPY } from '../../constants/game';

interface GameAnswerInputProps {
    disabled: boolean;
    onSubmit: (content: string) => boolean;
}

export function GameAnswerInput({
    disabled,
    onSubmit,
}: GameAnswerInputProps) {
    const [answer, setAnswer] = useState('');
    const trimmedAnswer = answer.trim();
    const isSubmitDisabled = disabled || !trimmedAnswer;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitDisabled || !onSubmit(trimmedAnswer)) {
            return;
        }

        setAnswer('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex h-[52px] gap-[8px]"
        >
            <label className="sr-only" htmlFor="game-answer-input">
                {GAME_COPY.ANSWER_PLACEHOLDER}
            </label>
            <input
                id="game-answer-input"
                type="text"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={GAME_COPY.ANSWER_PLACEHOLDER}
                className="h-[52px] min-w-0 flex-1 rounded-xl border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-[14px] text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[var(--monomat-primary)]"
            />
            <button
                type="submit"
                disabled={isSubmitDisabled}
                aria-label={GAME_COPY.ANSWER_ACTION_ARIA_LABEL}
                title={GAME_COPY.ANSWER_ACTION_ARIA_LABEL}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[var(--monomat-primary)] text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Send
                    size={25}
                    strokeWidth={2}
                    className="-rotate-12"
                    aria-hidden="true"
                />
            </button>
        </form>
    );
}
