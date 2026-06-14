const TOKEN_KEY = 'pcc_access_token'
const EXPIRES_KEY = 'pcc_token_expires'

export const authToken = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getExpiry(): Date | null {
    const raw = localStorage.getItem(EXPIRES_KEY)
    if (!raw) return null
    return new Date(raw)
  },

  set(token: string, expiresAtUtc: string): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(EXPIRES_KEY, expiresAtUtc)
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRES_KEY)
  },

  isValid(): boolean {
    const token = this.get()
    if (!token) return false
    const expiry = this.getExpiry()
    if (!expiry) return true
    return expiry > new Date()
  },
}
