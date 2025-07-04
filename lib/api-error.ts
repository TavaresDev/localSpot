import { NextResponse } from "next/server";

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

export class APIException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = "APIException";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new APIException("BAD_REQUEST", message, 400, details);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new APIException("UNAUTHORIZED", message, 401);
  }

  static forbidden(message: string = "Forbidden") {
    return new APIException("FORBIDDEN", message, 403);
  }

  static notFound(message: string = "Not found") {
    return new APIException("NOT_FOUND", message, 404);
  }

  static internal(message: string = "Internal server error", details?: unknown) {
    return new APIException("INTERNAL_ERROR", message, 500, details);
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof APIException) {
    const response: APIError = {
      code: error.code,
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.details : undefined,
    };

    return NextResponse.json(response, { status: error.statusCode });
  }

  if (error instanceof Error) {
    const response: APIError = {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" 
        ? error.message 
        : "An unexpected error occurred",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };

    return NextResponse.json(response, { status: 500 });
  }

  const response: APIError = {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  };

  return NextResponse.json(response, { status: 500 });
}

export function withErrorHandling(
  // Use a more permissive type that matches Next.js 15 route handlers
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}