import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  description?: string
  // Berilsa, "Qayta urinish" tugmasi ko'rinadi va shu funksiyani chaqiradi.
  onRetry?: () => void
  className?: string
}

// Xatolik holatlari uchun qayta ishlatiladigan markaziy ko'rinish.
export default function ErrorState({
  title = "Xatolik yuz berdi",
  description = "Ma'lumotlarni yuklab bo'lmadi. Iltimos, qayta urinib ko'ring.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </Button>
      )}
    </div>
  )
}
