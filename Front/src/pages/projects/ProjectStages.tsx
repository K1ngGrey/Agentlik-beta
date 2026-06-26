import { useState } from "react"
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
  // null — yaratish rejimi (tahrirlash detal modaliga 6-bosqichda ulanadi).
  const [editingStage, setEditingStage] = useState<StageDto | null>(null)
  // Bosilgan bosqich — detal modali 6-bosqichda shu state ga ulanadi.
  const [selectedStage, setSelectedStage] = useState<StageDto | null>(null)

  // Order bo'yicha tartiblangan ro'yxat.
  const stages = (data?.succeeded ? (data.result ?? []) : [])
    .slice()
    .sort((a, b) => a.order - b.order)

  const total = stages.length
  const completed = stages.filter((s) => s.status === "Completed").length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  // Yangi bosqich uchun keyingi tartib raqami.
  const nextOrder =
    stages.length > 0 ? Math.max(...stages.map((s) => s.order)) + 1 : 1

  const handleCreate = () => {
    setEditingStage(null)
    setFormOpen(true)
  }

  // Card bosilganda — detal modali 6-bosqichda ulanadi.
  const handleStageClick = (stage: StageDto) => {
    setSelectedStage(stage)
  }

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
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Bosqich qo'shish
            </Button>
          )}
        </div>

        {/* Umumiy progress */}
        {total > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Umumiy progress</span>
              <span>
                {completed}/{total} tugallangan
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-xl border border-l-2 p-4"
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
        )}

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
              isSuperAdmin
                ? "Loyihaga birinchi bosqichni qo'shing."
                : undefined
            }
          />
        )}

        {!isLoading && !isError && total > 0 && (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-selected-stage={selectedStage?.id ?? undefined}
          >
            {stages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                onClick={handleStageClick}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Yaratish dialogi (faqat SuperAdmin uchun ochiladi) */}
      <StageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projectId={projectId}
        stage={editingStage}
        nextOrder={nextOrder}
      />

      {/* Detal modali — card bosilganda ochiladi */}
      <StageDetailDialog
        open={Boolean(selectedStage)}
        onOpenChange={(o) => !o && setSelectedStage(null)}
        projectId={projectId}
        stage={selectedStage}
      />
    </Card>
  )
}
