interface RecoveryTimeOffsetParams {
    serverStartedAtMs: number;
    timeLimitSeconds: number;
    remainingSeconds: number;
    clientReceivedAtMs: number;
}

function areFiniteNumbers(values: readonly number[]) {
    return values.every(Number.isFinite);
}

export function calculatePlaybackEventTimeOffsetMs(
    serverStartedAtMs: number,
    clientReceivedAtMs: number,
) {
    if (
        !areFiniteNumbers([serverStartedAtMs, clientReceivedAtMs]) ||
        serverStartedAtMs < 0 ||
        clientReceivedAtMs < 0
    ) {
        return null;
    }

    return serverStartedAtMs - clientReceivedAtMs;
}

export function calculateRecoveryTimeOffsetMs({
    serverStartedAtMs,
    timeLimitSeconds,
    remainingSeconds,
    clientReceivedAtMs,
}: RecoveryTimeOffsetParams) {
    if (
        !areFiniteNumbers([
            serverStartedAtMs,
            timeLimitSeconds,
            remainingSeconds,
            clientReceivedAtMs,
        ]) ||
        serverStartedAtMs < 0 ||
        timeLimitSeconds <= 0 ||
        remainingSeconds < 0 ||
        remainingSeconds > timeLimitSeconds ||
        clientReceivedAtMs < 0
    ) {
        return null;
    }

    const estimatedServerNowMs =
        serverStartedAtMs +
        (timeLimitSeconds - remainingSeconds) * 1000;

    return estimatedServerNowMs - clientReceivedAtMs;
}

export function getSyncedNowMs(
    clientNowMs: number,
    serverTimeOffsetMs: number | null,
) {
    if (
        !Number.isFinite(clientNowMs) ||
        serverTimeOffsetMs == null ||
        !Number.isFinite(serverTimeOffsetMs)
    ) {
        return clientNowMs;
    }

    return clientNowMs + serverTimeOffsetMs;
}
