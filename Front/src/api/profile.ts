import { useMutation, useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiResult } from "@/types/api"
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserDto,
} from "@/types/auth"

// TanStack Query kesh kalitlari.
export const profileKeys = {
  detail: () => ["profile"] as const,
}

// --- Typed API funksiyalari ---

export function getProfile(): Promise<ApiResult<UserDto>> {
  return apiClient.get<UserDto>("/api/profile")
}

export function updateProfile(
  body: UpdateProfileRequest
): Promise<ApiResult<UserDto>> {
  return apiClient.put<UserDto>("/api/profile", body)
}

export function changePassword(
  body: ChangePasswordRequest
): Promise<ApiResult<boolean>> {
  return apiClient.put<boolean>("/api/profile/password", body)
}

// --- TanStack Query hooklar ---

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => updateProfile(body),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => changePassword(body),
  })
}
