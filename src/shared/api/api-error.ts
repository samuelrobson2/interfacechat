// API Error class that matches backend ErrorResponse schema
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly responseMessage?: string;
  public readonly error?: string;
  public readonly code?: string;
  public readonly details: Record<string, unknown>;

  constructor(
    response: Response,
    errorData: {
      statusCode?: number;
      message?: string | string[];
      error?: string;
      code?: string;
    } & Record<string, unknown>,
  ) {
    // Extract message according to ErrorResponse schema
    let displayMessage = `HTTP ${response.status}: ${response.statusText}`;

    if (errorData.error) {
      // Use 'error' field if available (as shown in screenshot)
      displayMessage = errorData.error;
    } else if (errorData.message) {
      // Use 'message' field as fallback
      if (Array.isArray(errorData.message)) {
        // Handle array of messages
        displayMessage = errorData.message.join(", ");
      } else {
        displayMessage = errorData.message;
      }
    }

    super(displayMessage);
    this.name = "ApiError";
    this.statusCode = errorData.statusCode || response.status;
    // Convert array to string immediately
    this.responseMessage = errorData.message
      ? Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message
      : undefined;
    this.error = errorData.error;
    this.code = errorData.code;
    this.details = errorData;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiErrorMessage(
  error: unknown,
  defaultMessage?: string,
): string {
  if (isApiError(error)) {
    return error.responseMessage || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage || "Something went wrong";
}
