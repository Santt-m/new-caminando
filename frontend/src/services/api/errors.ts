import axios from 'axios';

export class ApiError extends Error {
    statusCode: number;
    code?: string;

    constructor(
        statusCode: number,
        message: string,
        code?: string
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
    }
}

export const handleApiError = (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Error de conexión';
        const code = error.response?.data?.error;

        return new ApiError(statusCode, message, code);
    }

    if (error instanceof Error) {
        return new ApiError(500, error.message);
    }

    return new ApiError(500, 'Error desconocido');
};
