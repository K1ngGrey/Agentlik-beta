import { CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import StageStatusBadge from "@/components/StageStatusBadge"
import { cn } from "@/lib/utils"
import type { StageDto, StageStatus } from "@/types/stage"

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

// Visual border/glow per status
const RING_STYLES: Record<StageStatus, string> = {
  NotStarted: "border-l-muted-foreground/30",
  InProgress:
    "border-l-warning shadow-[0_0_0_0px_hsl(38_90%_55%)] hover:shadow-[0_2px_12px_hsl(38_90%_55%/0.35)]",
  Completed:
    "border-l-success shadow-[0_0_0_0px_hsl(142_55%_45%)] hover:shadow-[0_2px_12px_hsl(142_55%_45%/0.35)]",
  Blocked: "border-l-destructive",
}

// Top-border highlight for the "is next active" signal (yellow)
const OUTER_RING: Record<StageStatus, string> = {
  NotStarted: "",
  InProgress: "ring-1 ring-warning/60",
  Completed: "ring-1 ring-success/60",
  Blocked: "ring-1 ring-destructive/40",
}

interface StageCardProps {
  stage: StageDto
  onClick: (stage: StageDto) => void
}

export default function StageCard({ stage, onClick }: StageCardProps) {
  const lastDate = stage.events[0]?.date ?? stage.startDate ?? null
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
        "flex h-full cursor-pointer flex-col border-l-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:-translate-y-0.5",
        RING_STYLES[stage.status],
        OUTER_RING[stage.status]
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            #{stage.order}
          </span>
          <StageStatusBadge status={stage.status} />
        </div>

        <h3 className="line-clamp-2 font-semibold leading-snug">{stage.name}</h3>

        {stage.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {stage.description}
          </p>
        )}

        <div className="mt-auto space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
            <span>Progress</span>
            <span
              className={cn(
                "font-medium",
                progress === 100 && "text-success",
                progress > 0 && progress < 100 && "text-warning"
              )}
            >
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress === 100 ? "bg-success" : "bg-warning"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(lastDate)}
        </p>
      </CardContent>
    </Card>
  )
}
