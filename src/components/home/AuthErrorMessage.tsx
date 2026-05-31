interface AuthGlobalErrorMessageProps {
    message: string | null;
    className?: string;
}

interface AuthFieldHeaderProps {
    htmlFor: string;
    label: string;
    errorMessage: string | null;
    labelClassName?: string;
}

export function AuthGlobalErrorMessage({
    message,
    className = '',
}: AuthGlobalErrorMessageProps) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="alert"
            className={`flex min-h-5 w-full max-w-[420px] items-center justify-center rounded-lg bg-[var(--monomat-danger-light)] px-2 py-[3px] text-center text-[10px] font-medium leading-[14px] text-[var(--monomat-danger)] sm:h-5 sm:overflow-hidden sm:py-0 ${className}`}
        >
            <span className="min-w-0 break-words sm:truncate">
                {message}
            </span>
        </div>
    );
}

export function AuthFieldHeader({
    htmlFor,
    label,
    errorMessage,
    labelClassName = 'text-[var(--monomat-text-muted)]',
}: AuthFieldHeaderProps) {
    return (
        <div className="mb-[7px] flex min-h-[14px] min-w-0 items-start gap-2">
            <label
                htmlFor={htmlFor}
                className={`shrink-0 text-xs font-medium leading-[14px] ${labelClassName}`}
            >
                {label}
            </label>

            {errorMessage ? (
                <p
                    role="alert"
                    className="flex h-[14px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[var(--monomat-danger-light)] px-2 text-center text-[9px] font-medium leading-[14px] text-[var(--monomat-danger)]"
                >
                    <span className="min-w-0 truncate">
                        {errorMessage}
                    </span>
                </p>
            ) : null}
        </div>
    );
}
