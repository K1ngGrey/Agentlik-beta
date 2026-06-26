import { useMemo, useState } from "react"
import { Search, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/EmptyState"
import ErrorState from "@/components/ErrorState"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/auth"
import type { ProjectMemberDto } from "@/types/project"
import { useUsers } from "@/api/users"
import { useAddProjectMember } from "@/api/projects"
import { MemberAvatar, ROLE_LABELS } from "@/pages/projects/memberUi"

interface AssignMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  // Allaqachon biriktirilgan a'zolar — ro'yxatdan chiqarib tashlanadi.
  members: ProjectMemberDto[]
}

export default function AssignMemberDialog({
  open,
  onOpenChange,
  projectId,
  members,
}: AssignMemberDialogProps) {
  const { data, isLoading, isError, refetch } = useUsers()
  const addMutation = useAddProjectMember(projectId)

  const [query, setQuery] = useState("")
  // Qaysi foydalanuvchi hozir qo'shilmoqda (tugma holatini ko'rsatish uchun).
  const [addingId, setAddingId] = useState<string | null>(null)

  const memberIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members]
  )

  // Faqat faol va hali biriktirilmagan foydalanuvchilar.
  const candidates = useMemo(() => {
    const users = data?.succeeded ? (data.result ?? []) : []
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => u.isActive && !memberIds.has(u.id))
      .filter(
        (u) =>
          !q ||
          u.fullName.toLowerCase().includes(q) ||
          u.login.toLowerCase().includes(q)
      )
  }, [data, memberIds, query])

  const handleAdd = (userId: string, fullName: string) => {
    setAddingId(userId)
    addMutation.mutate(userId, {
      onSuccess: (result) => {
        if (result.succeeded) {
          toast.success(`${fullName} loyihaga biriktirildi`)
        } else {
          toast.error(result.errors[0] ?? "Biriktirishda xatolik yuz berdi")
        }
        setAddingId(null)
      },
      onError: () => {
        toast.error("Serverga ulanishda xatolik yuz berdi")
        setAddingId(null)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loyihaga a'zo biriktirish</DialogTitle>
          <DialogDescription>
            Foydalanuvchini tanlab loyihaga qo'shing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ism yoki login bo'yicha qidirish..."
              className="pl-9"
              autoComplete="off"
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}

            {!isLoading && isError && (
              <ErrorState
                description="Foydalanuvchilarni yuklashda xatolik yuz berdi."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && candidates.length === 0 && (
              <EmptyState
                icon={UserPlus}
                title="Biriktiriladigan foydalanuvchi yo'q"
                description="Barcha faol foydalanuvchilar allaqachon biriktirilgan."
              />
            )}

            {!isLoading &&
              !isError &&
              candidates.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                >
                  <MemberAvatar name={user.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{user.login} · {ROLE_LABELS[user.role as Role]}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={addMutation.isPending && addingId === user.id}
                    onClick={() => handleAdd(user.id, user.fullName)}
                  >
                    <UserPlus className={cn("h-4 w-4")} />
                    Qo'shish
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
