import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Pencil,
  Trash2,
  Layers,
  CalendarDays,
  FolderKanban,
  Search,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/PageHeader"
import EmptyState from "@/components/EmptyState"
import ErrorState from "@/components/ErrorState"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import StatusBadge from "@/components/StatusBadge"
import type { ProjectDto, ProjectStatus } from "@/types/project"
import { useDeleteProject, useProjects } from "@/api/projects"
import { useAuthStore } from "@/store/authStore"
import ProjectFormDialog from "@/pages/projects/ProjectFormDialog"

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "Planned", label: "Rejalashtirilgan" },
  { value: "InProgress", label: "Jarayonda" },
  { value: "Completed", label: "Yakunlangan" },
  { value: "Suspended", label: "To'xtatilgan" },
]

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const isSuperAdmin = role === "SuperAdmin"

  const { data, isLoading, isError, refetch } = useProjects()
  const deleteMutation = useDeleteProject()

  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectDto | null>(null)
  const [deletingProject, setDeletingProject] = useState<ProjectDto | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("")

  const projects = data?.succeeded ? (data.result ?? []) : []

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "" || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  const hasActiveFilters = search !== "" || statusFilter !== ""

  const handleCreate = () => {
    setEditingProject(null)
    setFormOpen(true)
  }

  const handleEdit = (project: ProjectDto) => {
    setEditingProject(project)
    setFormOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deletingProject) return

    deleteMutation.mutate(deletingProject.id, {
      onSuccess: (result) => {
        if (result.succeeded) {
          toast.success("Loyiha o'chirildi")
          setDeletingProject(null)
        } else {
          toast.error(result.errors[0] ?? "O'chirishda xatolik yuz berdi")
        }
      },
      onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loyihalar"
        description="Agentlik loyihalari ro'yxati."
        actions={
          isSuperAdmin && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Yangi loyiha
            </Button>
          )
        }
      />

      {isLoading && <ProjectsSkeleton />}

      {!isLoading && isError && (
        <ErrorState
          description="Loyihalarni yuklashda xatolik yuz berdi."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="Loyihalar topilmadi"
          description={
            isSuperAdmin
              ? "Birinchi loyihani qo'shing."
              : "Hozircha sizga loyihalar biriktirilmagan."
          }
          action={
            isSuperAdmin && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Yangi loyiha
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Loyiha nomi bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ProjectStatus | "")}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Barcha statuslar" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(""); setStatusFilter("") }}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Tozalash
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} ta loyiha topildi
          </p>

          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="Hech narsa topilmadi"
              description="Filtr shartlariga mos loyiha yo'q. Qidiruvni o'zgartiring yoki filtrani tozalang."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      navigate(`/projects/${project.id}`)
                    }
                  }}
                  className="cursor-pointer transition-all duration-150 hover:border-primary/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CardHeader className="gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="leading-snug">{project.name}</CardTitle>
                      <StatusBadge status={project.status} className="shrink-0" />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description || "Tavsif yo'q"}
                    </p>
                  </CardHeader>

                  <CardContent className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4" />
                      {project.stagesCount} bosqich
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(project.createdAt)}
                    </span>
                  </CardContent>

                  {isSuperAdmin && (
                    <CardFooter className="justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Tahrirlash"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(project)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="O'chirish"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingProject(project)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Yaratish/Tahrirlash dialogi (faqat SuperAdmin uchun ochiladi) */}
      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
      />

      {/* O'chirishni tasdiqlash */}
      <AlertDialog
        open={Boolean(deletingProject)}
        onOpenChange={(open) => {
          if (!open) setDeletingProject(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Loyihani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingProject?.name} loyihasini o'chirmoqchimisiz? Bu amalni
              ortga qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                // Tasdiqlamaguncha dialog yopilmasin.
                e.preventDefault()
                handleConfirmDelete()
              }}
            >
              {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Loyihalar gridi uchun yuklanish skeleti.
function ProjectsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="gap-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
