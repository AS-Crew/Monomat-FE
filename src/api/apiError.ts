export const DEFAULT_API_ERROR_MESSAGE = '요청 처리 중 오류가 발생했습니다.';

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

function getStringField(
    payload: Record<string, unknown>,
    fieldName: 'message' | 'error',
) {
    const value = payload[fieldName];

    return typeof value === 'string' && value.trim()
        ? value
        : null;
}

export async function parseApiErrorMessage(
    response: Response,
    fallbackMessage = DEFAULT_API_ERROR_MESSAGE,
): Promise<string> {
    try {
        const payload = await response.clone().json() as unknown;

        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return fallbackMessage;
        }

        const record = payload as Record<string, unknown>;

        return (
            getStringField(record, 'message') ??
            getStringField(record, 'error') ??
            fallbackMessage
        );
    } catch {
        return fallbackMessage;
    }
}

export async function createApiError(
    response: Response,
    fallbackMessage = DEFAULT_API_ERROR_MESSAGE,
): Promise<ApiError> {
    return new ApiError(
        response.status,
        await parseApiErrorMessage(response, fallbackMessage),
    );
}
