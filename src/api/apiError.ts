export const DEFAULT_API_ERROR_MESSAGE = '요청 처리 중 오류가 발생했습니다.';

export class ApiError extends Error {
    status: number;
    code?: string;
    field?: string;

    constructor(
        status: number,
        message: string,
        code?: string,
        field?: string,
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.field = field;
    }
}

interface ApiErrorPayload {
    message: string;
    code?: string;
    field?: string;
}

function getStringField(
    payload: Record<string, unknown>,
    fieldName: 'message' | 'error' | 'detail' | 'code' | 'field',
) {
    const value = payload[fieldName];

    return typeof value === 'string' && value.trim()
        ? value
        : null;
}

function getNullableStringField(
    payload: Record<string, unknown>,
    fieldName: 'field',
) {
    const value = payload[fieldName];

    if (value == null) {
        return undefined;
    }

    return typeof value === 'string' && value.trim()
        ? value
        : undefined;
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

        return parseApiErrorPayloadFromRecord(
            payload as Record<string, unknown>,
            fallbackMessage,
        ).message;
    } catch {
        return fallbackMessage;
    }
}

function parseApiErrorPayloadFromRecord(
    record: Record<string, unknown>,
    fallbackMessage: string,
): ApiErrorPayload {
    return {
        message:
            getStringField(record, 'message') ??
            getStringField(record, 'error') ??
            getStringField(record, 'detail') ??
            getStringFromArrayField(record, 'errors') ??
            getStringFromArrayField(record, 'fieldErrors') ??
            fallbackMessage,
        code: getStringField(record, 'code') ?? undefined,
        field: getNullableStringField(record, 'field'),
    };
}

async function parseApiErrorPayload(
    response: Response,
    fallbackMessage = DEFAULT_API_ERROR_MESSAGE,
): Promise<ApiErrorPayload> {
    try {
        const payload = await response.clone().json() as unknown;

        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return { message: fallbackMessage };
        }

        return parseApiErrorPayloadFromRecord(
            payload as Record<string, unknown>,
            fallbackMessage,
        );
    } catch {
        return { message: fallbackMessage };
    }
}

export async function createApiError(
    response: Response,
    fallbackMessage = DEFAULT_API_ERROR_MESSAGE,
): Promise<ApiError> {
    const payload = await parseApiErrorPayload(response, fallbackMessage);

    return new ApiError(
        response.status,
        payload.message,
        payload.code,
        payload.field,
    );
}
