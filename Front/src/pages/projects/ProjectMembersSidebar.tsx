import { useState, useCallback } from "react"
import { UserPlus, X, Users as UsersIcon, Pin } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/auth"
import type { ProjectMemberDto } from "@/types/project"
import { useProjectMembers, useRemoveProjectMember } from "@/api/projects"
import { useAuthStore } from "@/store/authStore"
import AssignMemberDialog from "@/pages/projects/AssignMemberDialog"
import { MemberAvatar, ROLE_LABELS } from "@/pages/projects/memberUi"

interface ProjectMembersSidebarProps {
  projectId: string
}

function usePinnedMembers(projectId: string) {
  const key = `pinned_members_${projectId}`

  const getPinned = useCallback((): Set<string> => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return new Set()
      return new Set(JSON.parse(raw) as string[])
    } catch {
      return new Set()
    }
  }, [key])

  const [pinned, setPinnedState] = useState<Set<string>>(getPinned)

  const togglePin = useCallback(
    (userId: string) => {
      setPinnedState((prev) => {
        const next = new Set(prev)
        if (next.has(userId)) {
          next.delete(userId)
        } else {
          next.add(userId)
        }
        localStorage.setItem(key, JSON.stringify([...next]))
        return next
      })
    },
    [key]
  )

  return { pinned, togglePin }
}

export default function ProjectMembersSidebar({
  projectId,
}: ProjectMembersSidebarProps) {
  const role = useAuthStore((s) => s.user?.role)
  const isSuperAdmin = role === "SuperAdmin"

  const { data, isLoading } = useProjectMembers(projectId)
  const removeMutation = useRemoveProjectMember(projectId)
  const { pinned, togglePin } = usePinnedMembers(projectId)

  const [assignOpen, setAssignOpen] = useState(false)
  const [removing, setRemoving] = useState<ProjectMemberDto | null>(null)

  const members = data?.succeeded ? (data.result ?? []) : []

  // Separate pinned vs normal, both sorted by name
  const sorted = [...members].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  )
  const pinnedMembers = sorted.filter((m) => pinned.has(m.userId))
  const regularMembers = sorted.filter((m) => !pinned.has(m.userId))

  const handleConfirmRemove = () => {
    if (!removing) return
    removeMutation.mutate(removing.userId, {
      onSuccess: (result) => {
        if (result.succeeded) {
          toast.success(`${removing.fullName} loyihadan chiqarildi`)
          setRemoving(null)
        } else {
          toast.error(result.errors[0] ?? "Chiqarishda xatolik yuz berdi")
        }
      },
      onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
    })
  }

  const renderMember = (member: ProjectMemberDto) => {
    const isPinned = pinned.has(member.userId)
    return (
      <DropdownMenu key={member.userId}>
        <DropdownMenuTrigger asChild>
          <div
            className="group flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/60 focus-visible:outline-none"
            tabIndex={0}
          >
            <MemberAvatar name={member.fullName} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium leading-tight">
                  {member.fullName}
                </p>
                {isPinned && (
                  <Pin className="h-3 w-3 shrink-0 rotate-45 text-primary" />
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {ROLE_LABELS[member.role as Role]}
              </p>
            </div>
            {isSuperAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 text-muted-foreground opacity-0 transition-opacity",
                  "group-hover:opacity-100 hover:text-destructive"
                )}
                aria-label="Loyihadan chiqarish"
                onClick={(e) => {
                  e.stopPropagation()
                  setRemoving(member)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={() => togglePin(member.userId)}>
            <Pin className="h-4 w-4 rotate-45" />
            {isPinned ? "Mahkamlashni bekor qilish" : "Mahkamlash"}
          </DropdownMenuItem>
          {isSuperAdmin && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setRemoving(member)}
            >
              <X className="h-4 w-4" />
              Loyihadan chiqarish
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex h-full flex-col border-r">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
          A'zolar
          {!isLoading && (
            <span className="text-xs text-muted-foreground">
              ({members.length})
            </span>
          )}
        </div>
        {isSuperAdmin && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            aria-label="A'zo biriktirish"
            onClick={() => setAssignOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}

        {!isLoading && members.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Hali a'zo biriktirilmagan.
            {isSuperAdmin && (
              <Button
                variant="link"
                size="sm"
                className="mt-1 block w-full"
                onClick={() => setAssignOpen(true)}
              >
                A'zo qo'shish
              </Button>
            )}
          </div>
        )}

        {!isLoading && pinnedMembers.length > 0 && (
          <div className="mb-1">
            <p className="mb-0.5 flex items-center gap-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Pin className="h-2.5 w-2.5 rotate-45" />
              Mahkamlangan
            </p>
            {pinnedMembers.map(renderMember)}
          </div>
        )}

        {!isLoading && regularMembers.length > 0 && (
          <div>
            {pinnedMembers.length > 0 && (
              <p className="mb-0.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                A'zolar
              </p>
            )}
            {regularMembers.map(renderMember)}
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <AssignMemberDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          projectId={projectId}
          members={members}
        />
      )}

      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>A'zoni chiqarish</AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.fullName} ni loyihadan chiqarmoqchimisiz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmRemove()
              }}
            >
              {removeMutation.isPending ? "Chiqarilmoqda..." : "Chiqarish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
