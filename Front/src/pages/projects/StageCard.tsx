import { CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import StageStatusBadge from "@/components/StageStatusBadge"
import { cn } from "@/lib/utils"
import type { StageDto } from "@/types/stage"

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

/** Derives the visual state used for border/glow/progress-bar colour. */
function visualState(stage: StageDto): "completed" | "active" | "blocked" | "idle" {
  if (stage.status === "Completed" || stage.progress >= 100) return "completed"
  if (stage.status === "InProgress" || stage.progress > 0) return "active"
  if (stage.status === "Blocked") return "blocked"
  return "idle"
}

interface StageCardProps {
  stage: StageDto
  /** True when this card immediately follows a completed stage. */
  isNextActive?: boolean
  onClick: (stage: StageDto) => void
}

export default function StageCard({
  stage,
  isNextActive = false,
  onClick,
}: StageCardProps) {
  const lastDate = stage.events[0]?.date ?? stage.startDate ?? null
  const progress = Math.max(0, Math.min(100, stage.progress))
  const state = visualState(stage)

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
        // Base
        "relative flex h-full cursor-pointer flex-col border-l-[3px] transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:-translate-y-0.5",

        // Left-border colour
        state === "completed" && "border-l-success",
        state === "active" && "border-l-warning",
        state === "blocked" && "border-l-destructive",
        state === "idle" && "border-l-muted-foreground/30",

        // Outer ring  (always visible, not just on hover)
        state === "completed" &&
          "shadow-[inset_0_0_0_1px_hsl(var(--success)/0.35)] hover:shadow-[0_0_0_1.5px_hsl(var(--success)/0.6),0_4px_16px_hsl(var(--success)/0.20)]",
        state === "active" &&
          "shadow-[inset_0_0_0_1px_hsl(var(--warning)/0.35)] hover:shadow-[0_0_0_1.5px_hsl(var(--warning)/0.6),0_4px_16px_hsl(var(--warning)/0.20)]",
        state === "blocked" &&
          "hover:shadow-[0_0_0_1.5px_hsl(var(--destructive)/0.5),0_4px_16px_hsl(var(--destructive)/0.15)]",

        // If backend says InProgress but this card is the designated "next"
        // after a completed one, add a subtle yellow pulse ring
        isNextActive &&
          state !== "completed" &&
          "shadow-[inset_0_0_0_1.5px_hsl(var(--warning)/0.5)]"
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Order + badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            #{stage.order}
          </span>
          <StageStatusBadge status={stage.status} />
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 font-semibold leading-snug">{stage.name}</h3>

        {/* Description */}
        {stage.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {stage.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-auto space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
            <span>Progress</span>
            <span
              className={cn(
                "font-semibold",
                state === "completed" && "text-success",
                state === "active" && "text-warning",
                state === "blocked" && "text-destructive"
              )}
            >
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                state === "completed" && "bg-success",
                state === "active" && "bg-warning",
                state === "blocked" && "bg-destructive",
                state === "idle" && "bg-muted-foreground/30"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Date */}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {formatDate(lastDate)}
        </p>
      </CardContent>
    </Card>
  )
}
