import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/types/project"

// Loyiha holatlari uchun o'zbekcha matn va rang.
const STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  Planned: {
    label: "Rejalashtirilgan",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  InProgress: {
    label: "Jarayonda",
    className: "border-info/20 bg-info/10 text-info",
  },
  Completed: {
    label: "Tugallangan",
    className: "border-success/20 bg-success/10 text-success",
  },
  Suspended: {
    label: "To'xtatilgan",
    className: "border-warning/20 bg-warning/10 text-warning",
  },
}

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

// Loyiha holatini rangli badge ko'rinishida ko'rsatadi.
export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status]

  return (
    <Badge variant="outline" className={cn(style.className, className)}>
      {style.label}
    </Badge>
  )
}
