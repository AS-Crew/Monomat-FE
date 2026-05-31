interface MonomatLogoProps {
    className?: string;
    variant?: 'black' | 'white';
    size?: 'default' | 'small';
}

interface MonomatLogoMarkProps {
    className?: string;
}

export function MonomatLogoMark({
    className = 'h-[37px] w-[37px]',
}: MonomatLogoMarkProps) {
    return (
        <svg
            aria-hidden
            className={`${className} shrink-0`}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="1.5"
                y="1.5"
                width="45"
                height="45"
                rx="11"
                fill="#FEFEFE"
                stroke="var(--monomat-primary)"
                strokeWidth="3"
            />
            <path
                d="M20.25 8.95C18.75 8.08 16.88 9.16 16.88 10.89V25.11C16.88 26.84 18.75 27.92 20.25 27.05L32.58 19.94C34.08 19.07 34.08 16.93 32.58 16.06L20.25 8.95Z"
                fill="var(--monomat-primary)"
            />
            <rect
                x="11"
                y="31"
                width="3.5"
                height="9"
                rx="1.75"
                fill="var(--monomat-primary)"
            />
            <rect
                x="18"
                y="28"
                width="3.5"
                height="12"
                rx="1.75"
                fill="var(--monomat-primary)"
            />
            <rect
                x="26"
                y="32"
                width="3.5"
                height="9"
                rx="1.75"
                fill="var(--monomat-primary)"
            />
            <rect
                x="33.75"
                y="30"
                width="3.5"
                height="10"
                rx="1.75"
                fill="var(--monomat-primary)"
            />
        </svg>
    );
}

export function MonomatLogo({
    className = '',
    variant = 'black',
    size = 'default',
}: MonomatLogoProps) {
    const isSmall = size === 'small';
    const markClassName = isSmall ? 'h-9 w-9' : 'h-10 w-10';
    const textClassName = isSmall
        ? 'text-[26px]'
        : 'text-[28px]';
    const textColorClassName = variant === 'white' ? 'text-white' : 'text-black';

    return (
        <span className={`flex items-center gap-[10px] ${className}`}>
            <MonomatLogoMark className={markClassName} />
            <span className={`${textClassName} font-extrabold leading-none ${textColorClassName}`}>
                Monomat
            </span>
        </span>
    );
}
