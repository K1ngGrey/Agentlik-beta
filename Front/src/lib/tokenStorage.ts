import type { UserDto } from "@/types/auth"

// localStorage kalitlari (boshqa ilovalar bilan to'qnashmasligi uchun prefiks bilan).
const ACCESS_TOKEN_KEY = "msa_access_token"
const REFRESH_TOKEN_KEY = "msa_refresh_token"
const USER_KEY = "msa_user"

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  getUser(): UserDto | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserDto
    } catch {
      return null
    }
  },

  setUser(user: UserDto): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Login/refresh javobidan kelgan barcha ma'lumotni birdaniga saqlash uchun qulaylik.
  setSession(accessToken: string, refreshToken: string, user: UserDto): void {
    this.setAccessToken(accessToken)
    this.setRefreshToken(refreshToken)
    this.setUser(user)
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
