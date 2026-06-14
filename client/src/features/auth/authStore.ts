import { authToken } from '@/lib/authToken'

type Listener = () => void

class AuthStore {
  private listeners: Set<Listener> = new Set()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((l) => l())
  }

  isAuthenticated(): boolean {
    return authToken.isValid()
  }

  getToken(): string | null {
    return authToken.get()
  }

  login(token: string, expiresAtUtc: string): void {
    authToken.set(token, expiresAtUtc)
    this.notify()
  }

  logout(): void {
    authToken.clear()
    this.notify()
  }
}

export const authStore = new AuthStore()
