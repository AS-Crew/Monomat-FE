import { useCallback, useEffect, useRef, useState } from 'react';

interface UseChatCooldownOptions {
    cooldownMs: number;
}

interface UseChatCooldownReturn {
    isCoolingDown: boolean;
    remainingSeconds: number;
    startCooldown: () => void;
    canSend: () => boolean;
}

const COOLDOWN_TICK_MS = 250;

export function useChatCooldown({
                                    cooldownMs,
                                }: UseChatCooldownOptions): UseChatCooldownReturn {
    const cooldownUntilRef = useRef(0);
    const [remainingMs, setRemainingMs] = useState(0);

    const isCoolingDown = remainingMs > 0;
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    useEffect(() => {
        if (remainingMs <= 0) {
            return;
        }

        const timerId = window.setInterval(() => {
            const nextRemainingMs = Math.max(
                0,
                cooldownUntilRef.current - Date.now(),
            );

            setRemainingMs(nextRemainingMs);
        }, COOLDOWN_TICK_MS);

        return () => {
            window.clearInterval(timerId);
        };
    }, [remainingMs]);

    const startCooldown = useCallback(() => {
        const cooldownUntil = Date.now() + cooldownMs;

        cooldownUntilRef.current = cooldownUntil;
        setRemainingMs(cooldownMs);
    }, [cooldownMs]);

    const canSend = useCallback(() => {
        return Date.now() >= cooldownUntilRef.current;
    }, []);

    return {
        isCoolingDown,
        remainingSeconds,
        startCooldown,
        canSend,
    };
}