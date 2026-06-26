import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiResult } from "@/types/api"
import type {
  AddProjectMemberRequest,
  CreateProjectRequest,
  ProjectDetailDto,
  ProjectDto,
  ProjectMemberDto,
  UpdateProjectRequest,
} from "@/types/project"

// TanStack Query kesh kalitlari.
export const projectsKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
  members: (id: string) => ["projects", id, "members"] as const,
}

// --- Typed API funksiyalari ---

export function getProjects(): Promise<ApiResult<ProjectDto[]>> {
  return apiClient.get<ProjectDto[]>("/api/projects")
}

export function getProject(id: string): Promise<ApiResult<ProjectDetailDto>> {
  return apiClient.get<ProjectDetailDto>(`/api/projects/${id}`)
}

export function createProject(
  body: CreateProjectRequest
): Promise<ApiResult<ProjectDto>> {
  return apiClient.post<ProjectDto>("/api/projects", body)
}

export function updateProject(
  id: string,
  body: UpdateProjectRequest
): Promise<ApiResult<ProjectDto>> {
  return apiClient.put<ProjectDto>(`/api/projects/${id}`, body)
}

export function deleteProject(id: string): Promise<ApiResult<boolean>> {
  return apiClient.del<boolean>(`/api/projects/${id}`)
}

export function getProjectMembers(
  projectId: string
): Promise<ApiResult<ProjectMemberDto[]>> {
  return apiClient.get<ProjectMemberDto[]>(`/api/projects/${projectId}/members`)
}

export function addProjectMember(
  projectId: string,
  body: AddProjectMemberRequest
): Promise<ApiResult<ProjectMemberDto>> {
  return apiClient.post<ProjectMemberDto>(
    `/api/projects/${projectId}/members`,
    body
  )
}

export function removeProjectMember(
  projectId: string,
  userId: string
): Promise<ApiResult<boolean>> {
  return apiClient.del<boolean>(`/api/projects/${projectId}/members/${userId}`)
}

// --- TanStack Query hooklar ---

export function useProjects() {
  return useQuery({
    queryKey: projectsKeys.all,
    queryFn: getProjects,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateProjectRequest) => createProject(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProjectRequest }) =>
      updateProject(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all })
      queryClient.invalidateQueries({
        queryKey: projectsKeys.detail(variables.id),
      })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all })
    },
  })
}

// Loyiha a'zolari ro'yxati.
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: projectsKeys.members(projectId),
    queryFn: () => getProjectMembers(projectId),
    enabled: Boolean(projectId),
  })
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      addProjectMember(projectId, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectsKeys.members(projectId),
      })
      queryClient.invalidateQueries({
        queryKey: projectsKeys.detail(projectId),
      })
    },
  })
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectsKeys.members(projectId),
      })
      queryClient.invalidateQueries({
        queryKey: projectsKeys.detail(projectId),
      })
    },
  })
}
