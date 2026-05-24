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
    fieldName: 'message' | 'error' | 'detail',
) {
    const value = payload[fieldName];

    return typeof value === 'string' && value.trim()
        ? value
        : null;
}

function getStringFromArrayField(
    payload: Record<string, unknown>,
    fieldName: 'errors' | 'fieldErrors',
) {
    const value = payload[fieldName];

    if (!Array.isArray(value)) {
        return null;
    }

    const firstMessage = value
        .map((item) => {
            if (typeof item === 'string') {
                return item.trim();
            }

            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                return '';
            }

            const record = item as Record<string, unknown>;
            const message = record.message ?? record.defaultMessage;

            return typeof message === 'string' ? message.trim() : '';
        })
        .find(Boolean);

    return firstMessage ?? null;
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
            getStringField(record, 'detail') ??
            getStringFromArrayField(record, 'errors') ??
            getStringFromArrayField(record, 'fieldErrors') ??
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
