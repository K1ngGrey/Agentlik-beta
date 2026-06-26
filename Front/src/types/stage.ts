// Bosqich holatlari (backend JSON'da satr sifatida keladi).
export type StageStatus =
  | "NotStarted"
  | "InProgress"
  | "Completed"
  | "Blocked"

// Bosqich tarixidagi voqea (event) yozuvi.
export interface StageEventDto {
  id: string
  date: string
  text: string
}

export interface StageDto {
  id: string
  projectId: string
  name: string
  description: string
  order: number
  status: StageStatus
  startDate: string | null
  endDate: string | null
  progress: number
  owner: string | null
  events: StageEventDto[]
}

export interface CreateStageRequest {
  name: string
  description: string
  order: number
}

export interface UpdateStageRequest {
  name: string
  description: string
  order: number
  status: StageStatus
  startDate: string | null
  endDate: string | null
  progress: number
  owner: string | null
}

export interface UpdateStageStatusRequest {
  status: StageStatus
}

// Bosqichga yangi voqea (event) qo'shish so'rovi.
export interface AddStageEventRequest {
  date: string | null
  text: string
}
