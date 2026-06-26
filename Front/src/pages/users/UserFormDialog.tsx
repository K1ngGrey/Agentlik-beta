import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Role, UserDto } from "@/types/auth"
import { useCreateUser, useUpdateUser } from "@/api/users"

// Rol nomlarini foydalanuvchiga ko'rsatish uchun o'zbekcha matnlar.
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "SuperAdmin", label: "Bosh administrator" },
  { value: "Rahbar", label: "Rahbar" },
  { value: "Member", label: "A'zo" },
]

// Bitta sxema bilan ham yaratish, ham tahrirlashni qoplaymiz.
const userSchema = z.object({
  fullName: z.string().min(1, "F.I.Sh kiritilishi shart"),
  login: z.string().min(1, "Login kiritilishi shart"),
  password: z.string(),
  role: z.enum(["SuperAdmin", "Rahbar", "Member"]),
  isActive: z.boolean(),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // null bo'lsa — yaratish rejimi, aks holda tahrirlash rejimi.
  user: UserDto | null
}

export default function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const isEdit = Boolean(user)
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      login: "",
      password: "",
      role: "Member",
      isActive: true,
    },
  })

  // Dialog ochilganda tanlangan foydalanuvchiga mos qiymatlarni yuklaymiz.
  useEffect(() => {
    if (!open) return

    if (user) {
      form.reset({
        fullName: user.fullName,
        login: user.login,
        password: "",
        role: user.role,
        isActive: user.isActive,
      })
    } else {
      form.reset({
        fullName: "",
        login: "",
        password: "",
        role: "Member",
        isActive: true,
      })
    }
  }, [open, user, form])

  const onSubmit = (values: UserFormValues) => {
    // Parol faqat yaratishda majburiy.
    if (!isEdit && values.password.trim().length === 0) {
      form.setError("password", { message: "Parol kiritilishi shart" })
      return
    }

    if (isEdit && user) {
      updateMutation.mutate(
        {
          id: user.id,
          body: {
            fullName: values.fullName,
            role: values.role,
            isActive: values.isActive,
          },
        },
        {
          onSuccess: (data) => {
            if (data.succeeded) {
              toast.success("Foydalanuvchi yangilandi")
              onOpenChange(false)
            } else {
              toast.error(data.errors[0] ?? "Yangilashda xatolik yuz berdi")
            }
          },
          onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
        }
      )
    } else {
      createMutation.mutate(
        {
          fullName: values.fullName,
          login: values.login,
          password: values.password,
          role: values.role,
        },
        {
          onSuccess: (data) => {
            if (data.succeeded) {
              toast.success("Foydalanuvchi qo'shildi")
              onOpenChange(false)
            } else {
              toast.error(data.errors[0] ?? "Qo'shishda xatolik yuz berdi")
            }
          },
          onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Foydalanuvchi ma'lumotlarini yangilang."
              : "Yangi foydalanuvchi uchun ma'lumotlarni kiriting."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>F.I.Sh</FormLabel>
                  <FormControl>
                    <Input placeholder="To'liq ism" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login</FormLabel>
                  <FormControl>
                    {/* Login faqat yaratishda o'zgartiriladi. */}
                    <Input
                      placeholder="Login"
                      autoComplete="off"
                      disabled={isEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parol maydoni faqat yaratish rejimida ko'rinadi. */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parol</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Parol"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Rolni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Holat (Faol/Nofaol) faqat tahrirlash rejimida ko'rinadi. */}
            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Holat</FormLabel>
                      <FormDescription>
                        Faol foydalanuvchi tizimga kira oladi.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saqlanmoqda..."
                  : isEdit
                    ? "Saqlash"
                    : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
