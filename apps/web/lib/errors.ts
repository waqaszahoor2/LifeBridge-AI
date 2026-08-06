/**
 * Typed error codes for structured frontend error handling.
 * Maps backend and network conditions to safe, user-facing error states.
 */

export type AppErrorCode =
  | "CONFIGURATION_MISSING"
  | "NETWORK_ERROR"
  | "BACKEND_UNAVAILABLE"
  | "REQUEST_TIMEOUT"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_AUTHENTICATION_FAILED"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  code: AppErrorCode;
  retryable: boolean;
  retryAfter?: number;

  constructor(
    code: AppErrorCode,
    message: string,
    options?: { retryable?: boolean; retryAfter?: number }
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.retryAfter = options?.retryAfter;
  }
}

/**
 * Map a raw fetch error or HTTP response into a typed AppError.
 */
export function mapFetchError(err: unknown, context?: string): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof DOMException && err.name === "AbortError") {
    return new AppError("REQUEST_TIMEOUT", "The request was cancelled.", {
      retryable: true,
    });
  }

  if (err instanceof TypeError && String(err.message).toLowerCase().includes("fetch")) {
    return new AppError("NETWORK_ERROR", "Could not connect to the server. Please check your connection.", {
      retryable: true,
    });
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return new AppError("REQUEST_TIMEOUT", "The request timed out. Please try again.", {
        retryable: true,
      });
    }
    if (msg.includes("429") || msg.includes("rate limit")) {
      return new AppError("RATE_LIMITED", "Too many requests. Please wait a moment before trying again.", {
        retryable: true,
        retryAfter: 60,
      });
    }
    if (msg.includes("503") || msg.includes("502") || msg.includes("unavailable")) {
      return new AppError("BACKEND_UNAVAILABLE", "The service is temporarily unavailable. Please try again later.", {
        retryable: true,
      });
    }
    if (msg.includes("422") || msg.includes("validation")) {
      return new AppError("VALIDATION_ERROR", "The request contained invalid data.", {
        retryable: false,
      });
    }
  }

  const fallbackMessage = context
    ? `We could not complete this action. ${context}`
    : "We could not complete this action. Nothing was sent.";

  return new AppError("UNKNOWN_ERROR", fallbackMessage, { retryable: true });
}

/**
 * Map an HTTP status code into a typed AppError.
 */
export function mapHttpStatus(status: number, body?: string): AppError {
  switch (status) {
    case 429:
      return new AppError("RATE_LIMITED", "Too many requests. Please wait a moment.", {
        retryable: true,
        retryAfter: 60,
      });
    case 502:
    case 503:
      return new AppError("BACKEND_UNAVAILABLE", "The service is temporarily unavailable.", {
        retryable: true,
      });
    case 504:
      return new AppError("REQUEST_TIMEOUT", "The server took too long to respond.", {
        retryable: true,
      });
    case 422:
      return new AppError("VALIDATION_ERROR", body || "The request contained invalid data.", {
        retryable: false,
      });
    default:
      return new AppError("UNKNOWN_ERROR", body || `Request failed with status ${status}.`, {
        retryable: status >= 500,
      });
  }
}
