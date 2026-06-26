import { useMutation } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiResult } from "@/types/api"
import type { LoginRequest, LoginResponse } from "@/types/auth"
import { useAuthStore } from "@/store/authStore"

// --- Typed API funksiyalari ---

export function login(
  login: string,
  password: string
): Promise<ApiResult<LoginResponse>> {
  const body: LoginRequest = { login, password }
  return apiClient.post<LoginResponse>("/api/auth/login", body)
}

export function refresh(
  refreshToken: string
): Promise<ApiResult<LoginResponse>> {
  return apiClient.post<LoginResponse>("/api/auth/refresh", { refreshToken })
}

export function logout(): Promise<ApiResult<boolean>> {
  return apiClient.post<boolean>("/api/auth/logout")
}

// --- TanStack Query mutations ---

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (variables: LoginRequest) =>
      login(variables.login, variables.password),
    onSuccess: (data) => {
      // Faqat muvaffaqiyatli javobda store'ni yangilaymiz.
      if (data.succeeded && data.result) {
        setAuth(data.result)
      }
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => logout(),
    // Server javobidan qat'i nazar, lokal holatni tozalaymiz.
    onSettled: () => {
      clearAuth()
    },
  })
}
