import type { StageDto } from "@/types/stage"
import type { Role } from "@/types/auth"

// Loyiha holatlari (backend JSON'da satr sifatida keladi).
export type ProjectStatus = "Planned" | "InProgress" | "Completed" | "Suspended"

// Loyihaga biriktirilgan a'zo (foydalanuvchi ma'lumotlari bilan).
export interface ProjectMemberDto {
  userId: string
  fullName: string
  login: string
  role: Role
}

// Loyihaga a'zo biriktirish so'rovi.
export interface AddProjectMemberRequest {
  userId: string
}

export interface ProjectDto {
  id: string
  name: string
  description: string
  code: string
  client: string | null
  deadline: string | null
  status: ProjectStatus
  stagesCount: number
  createdAt: string
}

export interface ProjectDetailDto extends ProjectDto {
  stages: StageDto[]
  members: ProjectMemberDto[]
}

export interface CreateProjectRequest {
  name: string
  description: string
  code: string
  client: string | null
  deadline: string | null
}

export interface UpdateProjectRequest {
  name: string
  description: string
  status: ProjectStatus
  code: string
  client: string | null
  deadline: string | null
}
