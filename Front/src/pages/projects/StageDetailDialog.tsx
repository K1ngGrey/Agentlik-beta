import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import StageStatusBadge from "@/components/StageStatusBadge"
import type { StageDto } from "@/types/stage"
import { useAddStageEvent } from "@/api/stages"
import { useAuthStore } from "@/store/authStore"

// Sanani o'zbekcha qisqa formatda ko'rsatadi (StageCard bilan izchil).
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

interface StageDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  stage: StageDto | null
}

export default function StageDetailDialog({
  open,
  onOpenChange,
  projectId,
  stage,
}: StageDetailDialogProps) {
  const role = useAuthStore((s) => s.user?.role)
  const isSuperAdmin = role === "SuperAdmin"

  const addEvent = useAddStageEvent(projectId)

  const [eventText, setEventText] = useState("")
  const [eventDate, setEventDate] = useState("")

  if (!stage) return null

  const progress = Math.max(0, Math.min(100, stage.progress))

  // Voqealar — sana bo'yicha kamayuvchi (eng yangisi tepada).
  // Backend desc qaytarsa ham frontda xavfsiz qayta tartiblaymiz.
  const events = stage.events
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    const text = eventText.trim()
    if (!text) return

    addEvent.mutate(
      {
        stageId: stage.id,
        body: {
          text,
          date: eventDate ? new Date(eventDate).toISOString() : null,
        },
      },
      {
        onSuccess: (data) => {
          if (data.succeeded) {
            toast.success("Voqea qo'shildi")
            setEventText("")
            setEventDate("")
          } else {
            toast.error(data.errors[0] ?? "Voqea qo'shishda xatolik yuz berdi")
          }
        },
        onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              #{stage.order}
            </span>
            <span>{stage.name}</span>
            <StageStatusBadge status={stage.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Bajarilish foizi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm text-muted-foreground tabular-nums">
              <span>Bajarilish</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Mas'ul shaxs */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Mas'ul shaxs</p>
            <p className="text-sm text-muted-foreground">
              {stage.owner ?? "—"}
            </p>
          </div>

          {/* To'liq tavsif */}
          {stage.description && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Tavsif</p>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {stage.description}
              </p>
            </div>
          )}

          {/* Voqealar tarixi — timeline */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Voqealar tarixi</p>

            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Hozircha voqealar yo'q
              </p>
            ) : (
              <ol className="space-y-4 border-l border-border pl-5">
                {events.map((event) => (
                  <li key={event.id} className="relative">
                    {/* Timeline nuqtasi */}
                    <span className="absolute -left-[1.4375rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(event.date)}
                    </p>
                    <p className="whitespace-pre-line text-sm">{event.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Voqea qo'shish formasi — faqat SuperAdmin uchun */}
          {isSuperAdmin && (
            <form
              onSubmit={handleAddEvent}
              className="space-y-3 rounded-lg border bg-muted/30 p-4"
            >
              <p className="text-sm font-medium">Voqea qo'shish</p>

              <div className="space-y-1.5">
                <Label htmlFor="event-text">Matn</Label>
                <Textarea
                  id="event-text"
                  value={eventText}
                  onChange={(e) => setEventText(e.target.value)}
                  placeholder="Nima sodir bo'ldi?"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-date">Sana (ixtiyoriy)</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={addEvent.isPending || !eventText.trim()}
                >
                  {addEvent.isPending ? "Qo'shilmoqda..." : "Voqea qo'shish"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Yopish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
