import { NextResponse } from "next/server"

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL"

export type ApiSuccess<T> = {
  data: T
}

export type ApiFailure = {
  error: {
    code: ApiErrorCode
    message: string
  }
}

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ data }, init)
}

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json<ApiFailure>(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  )
}
