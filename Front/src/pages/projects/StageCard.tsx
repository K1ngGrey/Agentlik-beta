import { CalendarDays } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import StageStatusBadge from "@/components/StageStatusBadge"
import { cn } from "@/lib/utils"
import type { StageDto, StageStatus } from "@/types/stage"

// Sanani o'zbekcha qisqa formatda ko'rsatadi.
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

// Holatga mos chap chegara rangi — StageStatusBadge ranglari bilan izchil.
const BORDER_STYLES: Record<StageStatus, string> = {
  NotStarted: "border-l-muted-foreground/30",
  InProgress: "border-l-info",
  Completed: "border-l-success",
  Blocked: "border-l-destructive",
}

interface StageCardProps {
  stage: StageDto
  onClick: (stage: StageDto) => void
}

// Bitta bosqichni bosiladigan card ko'rinishida ko'rsatadi.
export default function StageCard({ stage, onClick }: StageCardProps) {
  // Oxirgi voqea sanasi, bo'lmasa boshlanish sanasi, u ham yo'q bo'lsa "—".
  const lastDate =
    stage.events[0]?.date ?? stage.startDate ?? null
  const progress = Math.max(0, Math.min(100, stage.progress))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick(stage)
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onClick(stage)}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex h-full cursor-pointer flex-col border-l-2 transition-shadow transition-colors",
        "hover:border-border hover:shadow-md focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        BORDER_STYLES[stage.status]
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Yuqorida: #order + holat badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            #{stage.order}
          </span>
          <StageStatusBadge status={stage.status} />
        </div>

        {/* Bosqich nomi */}
        <h3 className="line-clamp-2 font-semibold leading-snug">
          {stage.name}
        </h3>

        {/* Qisqa tavsif */}
        {stage.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {stage.description}
          </p>
        )}

        {/* Progress bar + foiz */}
        <div className="mt-auto space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Oxirgi voqea sanasi */}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(lastDate)}
        </p>
      </CardContent>
    </Card>
  )
}
