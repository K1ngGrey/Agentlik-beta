import { useState, useRef, useLayoutEffect, useCallback } from "react"
import { Plus, ListChecks } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import StageCard from "@/pages/projects/StageCard"
import StageFormDialog from "@/pages/projects/StageFormDialog"
import StageDetailDialog from "@/pages/projects/StageDetailDialog"
import EmptyState from "@/components/EmptyState"
import ErrorState from "@/components/ErrorState"
import type { StageDto } from "@/types/stage"
import { useStages } from "@/api/stages"
import { useAuthStore } from "@/store/authStore"

interface ProjectStagesProps {
  projectId: string
}

export default function ProjectStages({ projectId }: ProjectStagesProps) {
  const role = useAuthStore((s) => s.user?.role)
  const isSuperAdmin = role === "SuperAdmin"
  const { data, isLoading, isError, refetch } = useStages(projectId)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<StageDto | null>(null)
  const [selectedStage, setSelectedStage] = useState<StageDto | null>(null)

  const stages = (data?.succeeded ? (data.result ?? []) : [])
    .slice()
    .sort((a, b) => a.order - b.order)

  const total = stages.length
  const completedCount = stages.filter(
    (s) => s.status === "Completed" || s.progress >= 100
  ).length
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const nextOrder =
    stages.length > 0 ? Math.max(...stages.map((s) => s.order)) + 1 : 1

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>Bosqichlar</CardTitle>
            <CardDescription>
              Loyihaning bosqichma-bosqich rivojlanishi.
            </CardDescription>
          </div>
          {isSuperAdmin && (
            <Button size="sm" onClick={() => { setEditingStage(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4" />
              Bosqich qo'shish
            </Button>
          )}
        </div>
        {total > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Umumiy progress</span>
              <span>{completedCount}/{total} tugallangan</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && <StagesSkeleton />}

        {!isLoading && isError && (
          <ErrorState
            description="Bosqichlarni yuklashda xatolik yuz berdi."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && total === 0 && (
          <EmptyState
            icon={ListChecks}
            title="Hozircha bosqichlar yo'q"
            description={
              isSuperAdmin ? "Loyihaga birinchi bosqichni qo'shing." : undefined
            }
          />
        )}

        {!isLoading && !isError && total > 0 && (
          <StageGrid stages={stages} onStageClick={setSelectedStage} />
        )}
      </CardContent>

      <StageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projectId={projectId}
        stage={editingStage}
        nextOrder={nextOrder}
      />
      <StageDetailDialog
        open={Boolean(selectedStage)}
        onOpenChange={(o) => !o && setSelectedStage(null)}
        projectId={projectId}
        stage={selectedStage}
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Stage grid with SVG connector lines
// ---------------------------------------------------------------------------

interface Connector {
  fromIdx: number
  toIdx: number
}

interface StageGridProps {
  stages: StageDto[]
  onStageClick: (stage: StageDto) => void
}

function StageGrid({ stages, onStageClick }: StageGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [lines, setLines] = useState<
    Array<{ x1: number; y1: number; x2: number; y2: number }>
  >([])

  // Determine which consecutive pairs should have a connector
  const connectors: Connector[] = []
  for (let i = 0; i < stages.length - 1; i++) {
    const s = stages[i]
    if (s.status === "Completed" || s.progress >= 100) {
      connectors.push({ fromIdx: i, toIdx: i + 1 })
    }
  }

  // Index of the "next active" card: first stage after the last completed run
  const lastCompletedIdx = stages.reduce(
    (last, s, i) =>
      s.status === "Completed" || s.progress >= 100 ? i : last,
    -1
  )
  const nextActiveIdx =
    lastCompletedIdx >= 0 && lastCompletedIdx < stages.length - 1
      ? lastCompletedIdx + 1
      : -1

  const measure = useCallback(() => {
    if (!gridRef.current || connectors.length === 0) {
      setLines([])
      return
    }
    const gridRect = gridRef.current.getBoundingClientRect()
    const newLines: typeof lines = []

    for (const { fromIdx, toIdx } of connectors) {
      const fromEl = cardRefs.current.get(fromIdx)
      const toEl = cardRefs.current.get(toIdx)
      if (!fromEl || !toEl) continue

      const fromRect = fromEl.getBoundingClientRect()
      const toRect = toEl.getBoundingClientRect()

      // Origin: right-centre of "from" card
      const x1 = fromRect.right - gridRect.left
      const y1 = fromRect.top + fromRect.height / 2 - gridRect.top

      // Target: left-centre of "to" card
      const x2 = toRect.left - gridRect.left
      const y2 = toRect.top + toRect.height / 2 - gridRect.top

      newLines.push({ x1, y1, x2, y2 })
    }
    setLines(newLines)
  }, [connectors, stages]) // eslint-disable-line react-hooks/exhaustive-deps

  // Measure after paint and on resize
  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (gridRef.current) ro.observe(gridRef.current)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div ref={gridRef} className="relative">
      {/* SVG connector overlay */}
      {lines.length > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 z-10 overflow-visible"
          width="100%"
          height="100%"
          aria-hidden
        >
          <defs>
            <marker
              id="arrow-green"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M0,0 L0,6 L8,3 z"
                fill="hsl(var(--success))"
                opacity="0.9"
              />
            </marker>
          </defs>
          {lines.map((l, i) => {
            // Draw a smooth cubic bezier from right-centre → left-centre
            const dx = Math.abs(l.x2 - l.x1) * 0.5
            const cx1 = l.x1 + dx
            const cy1 = l.y1
            const cx2 = l.x2 - dx
            const cy2 = l.y2
            const d = `M ${l.x1} ${l.y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${l.x2} ${l.y2}`
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="2"
                strokeOpacity="0.75"
                strokeDasharray="5 3"
                markerEnd="url(#arrow-green)"
                style={{
                  filter: "drop-shadow(0 0 3px hsl(var(--success) / 0.5))",
                }}
              />
            )
          })}
        </svg>
      )}

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            ref={(el) => {
              if (el) cardRefs.current.set(index, el)
              else cardRefs.current.delete(index)
            }}
          >
            <StageCard
              stage={stage}
              isNextActive={index === nextActiveIdx}
              onClick={onStageClick}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function StagesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-xl border border-l-[3px] border-l-muted-foreground/20 p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}
