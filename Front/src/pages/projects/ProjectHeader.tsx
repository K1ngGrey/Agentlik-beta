import { useMemo } from "react"
import { Building2, CalendarClock } from "lucide-react"

import StatusBadge from "@/components/StatusBadge"
import { cn } from "@/lib/utils"
import type { ProjectDetailDto } from "@/types/project"

// Sanani o'zbekcha qisqa formatda ko'rsatadi (ProjectStages uslubida).
function formatDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

interface ProjectHeaderProps {
  project: ProjectDetailDto
}

// Loyiha detal sahifasining boy sarlavha bloki:
// kod, nom + status, mijoz/muddat, umumiy progress va bosqich sanog'i.
export default function ProjectHeader({ project }: ProjectHeaderProps) {
  // Bosqichlardan hisob-kitoblar — bo'sh massivda ham xavfsiz.
  const { progress, completed, inProgress, blocked } = useMemo(() => {
    const stages = project.stages
    const total = stages.length

    const avg =
      total > 0
        ? Math.round(
            stages.reduce((sum, s) => sum + s.progress, 0) / total
          )
        : 0

    return {
      progress: avg,
      completed: stages.filter((s) => s.status === "Completed").length,
      inProgress: stages.filter((s) => s.status === "InProgress").length,
      blocked: stages.filter((s) => s.status === "Blocked").length,
    }
  }, [project.stages])

  return (
    <div className="space-y-4">
      {/* Kod + nom + status */}
      <div className="space-y-2">
        <span className="inline-flex items-center rounded-md border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {project.code}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <StatusBadge status={project.status} />
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>

      {/* Mijoz va muddat */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span className="text-foreground">{project.client || "—"}</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          <span className="text-foreground tabular-nums">
            {formatDate(project.deadline)}
          </span>
        </span>
      </div>

      {/* Umumiy bajarilish */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Umumiy bajarilish</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bosqich sanog'i */}
      <div className="flex flex-wrap items-center gap-2">
        <CountChip
          label="Tugatilgan"
          value={completed}
          className="border-success/20 bg-success/10 text-success"
        />
        <CountChip
          label="Jarayonda"
          value={inProgress}
          className="border-info/20 bg-info/10 text-info"
        />
        <CountChip
          label="To'siqda"
          value={blocked}
          className="border-destructive/20 bg-destructive/10 text-destructive"
        />
      </div>
    </div>
  )
}

interface CountChipProps {
  label: string
  value: number
  className?: string
}

// Bosqich holatlari bo'yicha kichik rangli sanoq chipi.
function CountChip({ label, value, className }: CountChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      <span className="tabular-nums">{value}</span>
      {label}
    </span>
  )
}
