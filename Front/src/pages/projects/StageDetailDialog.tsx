import { useState } from "react"
import { toast } from "sonner"
import { ChevronDown, Check, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import StageStatusBadge from "@/components/StageStatusBadge"
import type { StageDto, StageStatus } from "@/types/stage"
import { useAddStageEvent, useUpdateStageStatus } from "@/api/stages"
import { useAuthStore } from "@/store/authStore"

function formatEventDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

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

const STATUS_OPTIONS: { value: StageStatus; label: string }[] = [
  { value: "NotStarted", label: "Rejalashtirilgan" },
  { value: "InProgress", label: "Jarayonda" },
  { value: "Completed", label: "Tugallangan" },
  { value: "Blocked", label: "To'xtatilgan" },
]

const AUTO_LOG_PREFIXES = ["Holat o'zgartirildi:", "Taraqqiyot yangilandi:"]

function isAutoLog(text: string): boolean {
  return AUTO_LOG_PREFIXES.some((p) => text.startsWith(p))
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
  const updateStatus = useUpdateStageStatus(projectId)

  const [eventText, setEventText] = useState("")
  const [eventDate, setEventDate] = useState("")

  if (!stage) return null

  const progress = Math.max(0, Math.min(100, stage.progress))

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

  const handleStatusChange = (newStatus: StageStatus) => {
    if (newStatus === stage.status) return
    updateStatus.mutate(
      { id: stage.id, body: { status: newStatus } },
      {
        onSuccess: (data) => {
          if (data.succeeded) {
            const label =
              STATUS_OPTIONS.find((o) => o.value === newStatus)?.label ??
              newStatus
            toast.success(`Holat o'zgartirildi: ${label}`)
          } else {
            toast.error(
              data.errors[0] ?? "Holatni o'zgartirishda xatolik yuz berdi"
            )
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

          {/* Boshlanish / Tugash sanalari */}
          {(stage.startDate || stage.endDate) && (
            <div className="flex gap-6 text-sm">
              {stage.startDate && (
                <div className="space-y-0.5">
                  <p className="font-medium">Boshlanish</p>
                  <p className="text-muted-foreground tabular-nums">
                    {formatDate(stage.startDate)}
                  </p>
                </div>
              )}
              {stage.endDate && (
                <div className="space-y-0.5">
                  <p className="font-medium">Tugash</p>
                  <p className="text-muted-foreground tabular-nums">
                    {formatDate(stage.endDate)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* To'liq tavsif */}
          {stage.description && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Tavsif</p>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {stage.description}
              </p>
            </div>
          )}

          {/* Voqea qo'shish — faqat SuperAdmin */}
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

          {/* Voqealar tarixi — vertical timeline */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Voqealar tarixi</p>

            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Hozircha voqealar yo'q
              </p>
            ) : (
              <ol className="relative border-l border-border">
                {events.map((event) => {
                  const auto = isAutoLog(event.text)
                  return (
                    <li key={event.id} className="relative pb-5 pl-6 last:pb-0">
                      <span
                        className={`absolute -left-[5px] top-[6px] h-2.5 w-2.5 rounded-full border-2 border-background ${
                          auto ? "bg-primary/60" : "bg-muted-foreground/40"
                        }`}
                      />
                      <p className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                        {formatEventDate(event.date)}
                        {auto && <Zap className="h-3 w-3 shrink-0 text-primary/70" />}
                      </p>
                      <p className="mt-0.5 whitespace-pre-line text-sm">
                        {event.text}
                      </p>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          {isSuperAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updateStatus.isPending}
                  className="gap-1.5"
                >
                  <StageStatusBadge status={stage.status} />
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-44">
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => handleStatusChange(option.value)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>{option.label}</span>
                    {stage.status === option.value && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div />
          )}

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Yopish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
