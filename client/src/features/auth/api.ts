import { apiClient } from '@/lib/apiClient'
import type { LoginRequest, LoginApiResponse, TokenPayload } from './types'

function extractToken(raw: LoginApiResponse): TokenPayload {
  if ('data' in raw && raw.data) {
    return raw.data
  }
  return raw as TokenPayload
}

export async function loginApi(credentials: LoginRequest): Promise<TokenPayload> {
  const { data } = await apiClient.post<LoginApiResponse>('/api/auth/login', credentials)
  return extractToken(data)
}
