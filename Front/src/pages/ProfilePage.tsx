import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { CircleUser as UserCircle, Lock, Loader as Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import PageHeader from "@/components/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/store/authStore"
import { useUpdateProfile, useChangePassword } from "@/api/profile"
import type { Role } from "@/types/auth"

const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: "Bosh administrator",
  Rahbar: "Rahbar",
  Member: "A'zo",
}

// Profil tahrirlash sxemasi.
const profileSchema = z.object({
  fullName: z.string().min(1, "F.I.Sh kiritilishi shart"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// Parolni o'zgartirish sxemasi.
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Joriy parol kiritilishi shart"),
    newPassword: z
      .string()
      .min(6, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? "" },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Store'dagi user o'zgarsa formani ham yangilaymiz.
  useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.fullName })
    }
  }, [user, profileForm])

  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(
      { fullName: values.fullName },
      {
        onSuccess: (data) => {
          if (data.succeeded && data.result) {
            updateUser(data.result)
            toast.success("Profil yangilandi")
          } else {
            toast.error(data.errors[0] ?? "Yangilashda xatolik yuz berdi")
          }
        },
        onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
      }
    )
  }

  const onPasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: (data) => {
          if (data.succeeded) {
            toast.success("Parol o'zgartirildi")
            passwordForm.reset()
          } else {
            toast.error(data.errors[0] ?? "Parolni o'zgartirishda xatolik")
          }
        },
        onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
      }
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profil" description="Shaxsiy ma'lumotlaringiz." />
        <Card>
          <CardContent className="py-10">
            <Skeleton className="h-8 w-48" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Shaxsiy ma'lumotlaringizni boshqaring."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profil ma'lumotlari kartasi */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              Hisob ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
              <div className="text-center">
                <p className="font-medium">{user.fullName}</p>
                <p className="text-sm text-muted-foreground">@{user.login}</p>
              </div>
              <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Login</span>
                <span className="font-medium">{user.login}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rol</span>
                <span className="font-medium">{ROLE_LABELS[user.role]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holat</span>
                {user.isActive ? (
                  <Badge className="border-success/20 bg-success/10 text-success">
                    Faol
                  </Badge>
                ) : (
                  <Badge className="border-transparent bg-muted text-muted-foreground">
                    Nofaol
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tahrirlash va parol o'zgartirish */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profil tahrirlash */}
          <Card>
            <CardHeader>
              <CardTitle>Ma'lumotlarni tahrirlash</CardTitle>
              <CardDescription>
                F.I.Sh ni o'zgartirishingiz mumkin. Login o'zgartirib
                bo'lmaydi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
                    name="fullName"
                    render={() => (
                      <FormItem>
                        <FormLabel>Login</FormLabel>
                        <FormControl>
                          <Input value={user.login} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {updateProfileMutation.isPending
                        ? "Saqlanmoqda..."
                        : "Saqlash"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Parolni o'zgartirish */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                Parolni o'zgartirish
              </CardTitle>
              <CardDescription>
                Xavfsizlik uchun parolingizni muntazam yangilang.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Joriy parol</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="current-password"
                            placeholder="Joriy parolingiz"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yangi parol</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Yangi parol"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parolni tasdiqlang</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Yangi parolni qaytaring"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {changePasswordMutation.isPending
                        ? "O'zgartirilmoqda..."
                        : "Parolni o'zgartirish"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
