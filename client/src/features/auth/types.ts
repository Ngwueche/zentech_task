export type LoginRequest = {
  username: string
  password: string
}

export type TokenPayload = {
  accessToken: string
  expiresAtUtc: string
  tokenType: string
}

export type LoginApiResponse =
  | TokenPayload
  | {
      success: boolean
      message: string
      data: TokenPayload
    }

export type AuthState = {
  token: string | null
  isAuthenticated: boolean
}
