import { create } from "zustand"

import type { LoginResponse, UserDto } from "@/types/auth"
import { tokenStorage } from "@/lib/tokenStorage"

interface AuthState {
  user: UserDto | null
  accessToken: string | null
  isAuthenticated: boolean
  // Login/refresh javobini qabul qilib, holatni va localStorage'ni yangilaydi.
  setAuth: (loginResponse: LoginResponse) => void
  // Holatni va localStorage'ni tozalaydi (logout).
  clearAuth: () => void
}

// Sahifa yangilanganda boshlang'ich holatni localStorage'dan tiklaymiz.
function loadInitialState(): Pick<
  AuthState,
  "user" | "accessToken" | "isAuthenticated"
> {
  const user = tokenStorage.getUser()
  const accessToken = tokenStorage.getAccessToken()
  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitialState(),

  setAuth: (loginResponse) => {
    tokenStorage.setSession(
      loginResponse.accessToken,
      loginResponse.refreshToken,
      loginResponse.user
    )
    set({
      user: loginResponse.user,
      accessToken: loginResponse.accessToken,
      isAuthenticated: true,
    })
  },

  clearAuth: () => {
    tokenStorage.clear()
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  },
}))
