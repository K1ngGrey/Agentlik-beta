import { useQueries } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { FolderKanban, Loader as Loader2, CircleCheck as CheckCircle2, CalendarClock, CirclePause as PauseCircle, ArrowRight, Layers } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import StatusBadge from "@/components/StatusBadge"
import PageHeader from "@/components/PageHeader"
import EmptyState from "@/components/EmptyState"
import ErrorState from "@/components/ErrorState"
import { cn } from "@/lib/utils"
import { useProjects, projectsKeys, getProject } from "@/api/projects"
import type { ProjectDto, ProjectStatus } from "@/types/project"

const RECENT_LIMIT = 5

interface StatCardConfig {
  status: ProjectStatus
  label: string
  icon: LucideIcon
  iconClassName: string
  glowColor: string
  animation: string
}

const STAT_CARDS: StatCardConfig[] = [
  {
    status: "InProgress",
    label: "Jarayonda",
    icon: Loader2,
    iconClassName: "bg-info/10 text-info",
    glowColor: "hover:shadow-[0_0_0_1.5px_hsl(200_80%_55%),0_4px_20px_hsl(200_80%_55%/0.25)]",
    animation: "animate-spin-slow",
  },
  {
    status: "Completed",
    label: "Tugallangan",
    icon: CheckCircle2,
    iconClassName: "bg-success/10 text-success",
    glowColor: "hover:shadow-[0_0_0_1.5px_hsl(142_55%_45%),0_4px_20px_hsl(142_55%_45%/0.25)]",
    animation: "group-hover:animate-pulse-once",
  },
  {
    status: "Planned",
    label: "Rejalashtirilgan",
    icon: CalendarClock,
    iconClassName: "bg-amber-500/10 text-amber-400",
    glowColor: "hover:shadow-[0_0_0_1.5px_hsl(38_90%_55%),0_4px_20px_hsl(38_90%_55%/0.20)]",
    animation: "group-hover:animate-tilt",
  },
  {
    status: "Suspended",
    label: "To'xtatilgan",
    icon: PauseCircle,
    iconClassName: "bg-warning/10 text-warning",
    glowColor: "hover:shadow-[0_0_0_1.5px_hsl(38_90%_55%),0_4px_20px_hsl(38_90%_55%/0.20)]",
    animation: "animate-pulse-subtle",
  },
]

const BAR_COLORS: Record<ProjectStatus, string> = {
  InProgress: "bg-info",
  Completed: "bg-success",
  Planned: "bg-muted-foreground/40",
  Suspended: "bg-warning",
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  InProgress: "Jarayonda",
  Completed: "Tugallangan",
  Planned: "Rejalashtirilgan",
  Suspended: "To'xtatilgan",
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useProjects()
  const projects: ProjectDto[] = data?.succeeded ? (data.result ?? []) : []

  const counts: Record<ProjectStatus, number> = {
    InProgress: 0,
    Completed: 0,
    Planned: 0,
    Suspended: 0,
  }
  for (const project of projects) {
    counts[project.status] += 1
  }
  const total = projects.length

  const recentProjects = projects
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, RECENT_LIMIT)

  const stageQueries = useQueries({
    queries: recentProjects.map((project) => ({
      queryKey: projectsKeys.detail(project.id),
      queryFn: () => getProject(project.id),
    })),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boshqaruv paneli"
        description="Loyihalar holati bo'yicha umumiy ko'rinish."
      />

      {isLoading && <DashboardSkeleton />}
      {!isLoading && isError && (
        <ErrorState
          description="Ma'lumotlarni yuklashda xatolik yuz berdi."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Total projects card */}
            <Card
              className={cn(
                "group cursor-default transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-[0_0_0_1.5px_hsl(213_80%_56%),0_4px_24px_hsl(213_80%_56%/0.25)]"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardDescription className="font-medium">
                  Jami loyihalar
                </CardDescription>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FolderKanban className="h-5 w-5 transition-transform duration-300 group-hover:animate-bounce-once" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">{total}</p>
              </CardContent>
            </Card>

            {STAT_CARDS.map((card) => {
              const Icon = card.icon
              const isSpinning = card.status === "InProgress"
              const isPulse = card.status === "Suspended"
              return (
                <Card
                  key={card.status}
                  className={cn(
                    "group cursor-default transition-all duration-300",
                    "hover:-translate-y-1",
                    card.glowColor
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardDescription className="font-medium">
                      {card.label}
                    </CardDescription>
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md",
                        card.iconClassName
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isSpinning && "animate-spin-slow",
                          isPulse && "animate-pulse-subtle",
                          card.status === "Completed" &&
                            "transition-transform duration-200 group-hover:scale-125",
                          card.status === "Planned" &&
                            "transition-transform duration-200 group-hover:rotate-12"
                        )}
                      />
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold tabular-nums">
                      {counts[card.status]}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent projects */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <CardTitle>So'nggi loyihalar</CardTitle>
                    <CardDescription>
                      Eng yangi qo'shilgan loyihalar va ularning bosqich
                      progressi.
                    </CardDescription>
                  </div>
                  <Link
                    to="/projects"
                    className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Barchasi <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentProjects.length === 0 ? (
                  <EmptyState
                    icon={FolderKanban}
                    title="Hozircha loyihalar yo'q"
                    description="Yangi loyiha qo'shilgach, bu yerda ko'rinadi."
                  />
                ) : (
                  <ul className="divide-y">
                    {recentProjects.map((project, index) => {
                      const detail = stageQueries[index]?.data
                      const stages = detail?.succeeded
                        ? (detail.result?.stages ?? [])
                        : []
                      const stageTotal = stages.length
                      const completed = stages.filter(
                        (s) => s.status === "Completed"
                      ).length
                      const progress =
                        stageTotal > 0
                          ? Math.round((completed / stageTotal) * 100)
                          : 0

                      return (
                        <li key={project.id}>
                          <Link
                            to={`/projects/${project.id}`}
                            className="-mx-2 flex flex-col gap-2 rounded-md px-2 py-3 transition-colors hover:bg-accent"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 space-y-0.5">
                                <p className="truncate font-medium leading-snug">
                                  {project.name}
                                </p>
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Layers className="h-3.5 w-3.5" />
                                  {project.stagesCount} bosqich ·{" "}
                                  {formatDate(project.createdAt)}
                                </p>
                              </div>
                              <StatusBadge
                                status={project.status}
                                className="shrink-0"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Bosqich progressi</span>
                                <span className="tabular-nums">
                                  {stageTotal > 0
                                    ? `${completed}/${stageTotal}`
                                    : "—"}
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-success transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Status distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Holat bo'yicha taqsimot</CardTitle>
                <CardDescription>Loyihalarning holat ulushi.</CardDescription>
              </CardHeader>
              <CardContent>
                {total === 0 ? (
                  <EmptyState icon={Layers} title="Ma'lumot yo'q" />
                ) : (
                  <div className="space-y-4">
                    {STAT_CARDS.map((card) => {
                      const count = counts[card.status]
                      const percent =
                        total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={card.status} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {STATUS_LABELS[card.status]}
                            </span>
                            <span className="tabular-nums font-medium">
                              {count}{" "}
                              <span className="text-muted-foreground">
                                ({percent}%)
                              </span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                BAR_COLORS[card.status]
                              )}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
