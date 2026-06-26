import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StageStatus } from "@/types/stage"

// Bosqich holatlari uchun o'zbekcha matn va rang.
const STATUS_STYLES: Record<
  StageStatus,
  { label: string; className: string }
> = {
  NotStarted: {
    label: "Rejada",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  InProgress: {
    label: "Jarayonda",
    className: "border-info/20 bg-info/10 text-info",
  },
  Completed: {
    label: "Tugatilgan",
    className: "border-success/20 bg-success/10 text-success",
  },
  Blocked: {
    label: "To'siq",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
}

interface StageStatusBadgeProps {
  status: StageStatus
  className?: string
}

// Bosqich holatini rangli badge ko'rinishida ko'rsatadi.
export default function StageStatusBadge({
  status,
  className,
}: StageStatusBadgeProps) {
  const style = STATUS_STYLES[status]

  return (
    <Badge variant="outline" className={cn(style.className, className)}>
      {style.label}
    </Badge>
  )
}
