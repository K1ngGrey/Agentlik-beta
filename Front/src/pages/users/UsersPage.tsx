import { useState } from "react"
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import type { Role, UserDto } from "@/types/auth"
import { useDeleteUser, useUsers } from "@/api/users"
import UserFormDialog from "@/pages/users/UserFormDialog"

// Rol nomlarini foydalanuvchiga ko'rsatish uchun o'zbekcha matnlar.
const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: "Bosh administrator",
  Rahbar: "Rahbar",
  Member: "A'zo",
}

export default function UsersPage() {
  const { data, isLoading, isError, refetch } = useUsers()
  const deleteMutation = useDeleteUser()

  const [formOpen, setFormOpen] = useState(false)
  // null — yaratish rejimi, aks holda tahrirlanayotgan foydalanuvchi.
  const [editingUser, setEditingUser] = useState<UserDto | null>(null)
  // O'chirish tasdig'i kutilayotgan foydalanuvchi.
  const [deletingUser, setDeletingUser] = useState<UserDto | null>(null)

  const users = data?.succeeded ? (data.result ?? []) : []

  const handleCreate = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleEdit = (user: UserDto) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deletingUser) return

    deleteMutation.mutate(deletingUser.id, {
      onSuccess: (result) => {
        if (result.succeeded) {
          toast.success("Foydalanuvchi o'chirildi")
          setDeletingUser(null)
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
        title="Foydalanuvchilar"
        description="Tizim foydalanuvchilarini boshqarish."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Yangi foydalanuvchi
          </Button>
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>F.I.Sh</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && isError && (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <ErrorState
                    description="Foydalanuvchilarni yuklashda xatolik yuz berdi."
                    onRetry={() => refetch()}
                  />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon={UsersIcon}
                    title="Foydalanuvchilar yo'q"
                    description="Yangi foydalanuvchi qo'shing."
                  />
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName}
                  </TableCell>
                  <TableCell>{user.login}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="border-success/20 bg-success/10 text-success">
                        Faol
                      </Badge>
                    ) : (
                      <Badge className="border-transparent bg-muted text-muted-foreground">
                        Nofaol
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Tahrirlash"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="O'chirish"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Yaratish/Tahrirlash dialogi */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
      />

      {/* O'chirishni tasdiqlash */}
      <AlertDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser?.fullName} foydalanuvchisini o'chirmoqchimisiz?
              Bu amalni ortga qaytarib bo'lmaydi.
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
