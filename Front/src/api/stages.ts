import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import { projectsKeys } from "@/api/projects"
import type { ApiResult } from "@/types/api"
import type {
  AddStageEventRequest,
  CreateStageRequest,
  StageDto,
  StageEventDto,
  UpdateStageRequest,
  UpdateStageStatusRequest,
} from "@/types/stage"

// TanStack Query kesh kalitlari — har loyiha uchun alohida.
export const stagesKeys = {
  list: (projectId: string) => ["projects", projectId, "stages"] as const,
}

// --- Typed API funksiyalari ---

export function getStages(
  projectId: string
): Promise<ApiResult<StageDto[]>> {
  return apiClient.get<StageDto[]>(`/api/projects/${projectId}/stages`)
}

export function createStage(
  projectId: string,
  body: CreateStageRequest
): Promise<ApiResult<StageDto>> {
  return apiClient.post<StageDto>(`/api/projects/${projectId}/stages`, body)
}

export function updateStage(
  projectId: string,
  id: string,
  body: UpdateStageRequest
): Promise<ApiResult<StageDto>> {
  return apiClient.put<StageDto>(
    `/api/projects/${projectId}/stages/${id}`,
    body
  )
}

export function deleteStage(
  projectId: string,
  id: string
): Promise<ApiResult<boolean>> {
  return apiClient.del<boolean>(`/api/projects/${projectId}/stages/${id}`)
}

export function updateStageStatus(
  projectId: string,
  id: string,
  body: UpdateStageStatusRequest
): Promise<ApiResult<StageDto>> {
  return apiClient.patch<StageDto>(
    `/api/projects/${projectId}/stages/${id}/status`,
    body
  )
}

export function addStageEvent(
  projectId: string,
  stageId: string,
  body: AddStageEventRequest
): Promise<ApiResult<StageEventDto>> {
  return apiClient.post<StageEventDto>(
    `/api/projects/${projectId}/stages/${stageId}/events`,
    body
  )
}

// --- TanStack Query hooklar ---

// Bosqichlar ro'yxati va loyiha detalini birga yangilaymiz
// (loyiha detalida bosqichlar soni/ro'yxati ham bor).
function invalidateStages(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string
) {
  queryClient.invalidateQueries({ queryKey: stagesKeys.list(projectId) })
  queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) })
}

export function useStages(projectId: string) {
  return useQuery({
    queryKey: stagesKeys.list(projectId),
    queryFn: () => getStages(projectId),
    enabled: Boolean(projectId),
  })
}

export function useCreateStage(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateStageRequest) => createStage(projectId, body),
    onSuccess: () => invalidateStages(queryClient, projectId),
  })
}

export function useUpdateStage(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStageRequest }) =>
      updateStage(projectId, id, body),
    onSuccess: () => invalidateStages(queryClient, projectId),
  })
}

export function useDeleteStage(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStage(projectId, id),
    onSuccess: () => invalidateStages(queryClient, projectId),
  })
}

export function useUpdateStageStatus(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: UpdateStageStatusRequest
    }) => updateStageStatus(projectId, id, body),
    onSuccess: () => invalidateStages(queryClient, projectId),
  })
}

export function useAddStageEvent(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      stageId,
      body,
    }: {
      stageId: string
      body: AddStageEventRequest
    }) => addStageEvent(projectId, stageId, body),
    onSuccess: () => invalidateStages(queryClient, projectId),
  })
}
