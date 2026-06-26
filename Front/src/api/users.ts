import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiResult } from "@/types/api"
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
} from "@/types/auth"

// TanStack Query kesh kalitlari.
export const usersKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
}

// --- Typed API funksiyalari ---

export function getUsers(): Promise<ApiResult<UserDto[]>> {
  return apiClient.get<UserDto[]>("/api/users")
}

export function getUser(id: string): Promise<ApiResult<UserDto>> {
  return apiClient.get<UserDto>(`/api/users/${id}`)
}

export function createUser(
  body: CreateUserRequest
): Promise<ApiResult<UserDto>> {
  return apiClient.post<UserDto>("/api/users", body)
}

export function updateUser(
  id: string,
  body: UpdateUserRequest
): Promise<ApiResult<UserDto>> {
  return apiClient.put<UserDto>(`/api/users/${id}`, body)
}

export function deleteUser(id: string): Promise<ApiResult<boolean>> {
  return apiClient.del<boolean>(`/api/users/${id}`)
}

// --- TanStack Query hooklar ---

export function useUsers() {
  return useQuery({
    queryKey: usersKeys.all,
    queryFn: getUsers,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateUserRequest) => createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserRequest }) =>
      updateUser(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}
