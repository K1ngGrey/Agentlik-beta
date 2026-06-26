import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  // O'ng tomonda ko'rinadigan amallar (tugmalar va h.k.).
  actions?: React.ReactNode
  className?: string
}

// Barcha sahifalarda izchil sarlavha bloki: chapda matn, o'ngda amallar.
export default function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
