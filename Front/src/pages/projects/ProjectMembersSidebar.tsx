import { useState } from "react"
import { UserPlus, X, Users as UsersIcon } from "lucide-react"
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

// Telegram uslubidagi chap panel — loyihaga biriktirilgan a'zolar ro'yxati.
export default function ProjectMembersSidebar({
  projectId,
}: ProjectMembersSidebarProps) {
  const role = useAuthStore((s) => s.user?.role)
  const isSuperAdmin = role === "SuperAdmin"

  const { data, isLoading } = useProjectMembers(projectId)
  const removeMutation = useRemoveProjectMember(projectId)

  const [assignOpen, setAssignOpen] = useState(false)
  // O'chirish tasdig'i kutilayotgan a'zo.
  const [removing, setRemoving] = useState<ProjectMemberDto | null>(null)

  const members = data?.succeeded ? (data.result ?? []) : []

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

  return (
    <div className="flex h-full flex-col border-r">
      {/* Panel sarlavhasi: a'zolar soni + biriktirish tugmasi */}
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

      {/* A'zolar ro'yxati */}
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
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

        {!isLoading &&
          members.map((member) => (
            <div
              key={member.userId}
              className="group flex items-center gap-3 rounded-md p-2 hover:bg-muted/60"
            >
              <MemberAvatar name={member.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">
                  {member.fullName}
                </p>
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
                  onClick={() => setRemoving(member)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
      </div>

      {/* Biriktirish dialogi (faqat SuperAdmin) */}
      {isSuperAdmin && (
        <AssignMemberDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          projectId={projectId}
          members={members}
        />
      )}

      {/* Chiqarishni tasdiqlash */}
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
