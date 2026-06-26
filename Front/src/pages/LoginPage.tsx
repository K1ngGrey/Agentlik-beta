import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useLocation, Navigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useLogin } from "@/api/auth"
import { useAuthStore } from "@/store/authStore"

const loginSchema = z.object({
  login: z.string().min(1, "Login kiritilishi shart"),
  password: z.string().min(1, "Parol kiritilishi shart"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loginMutation = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" },
  })

  // Allaqachon kirgan bo'lsa, login sahifasini ko'rsatmaymiz.
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Kirishdan oldin foydalanuvchi bormoqchi bo'lgan sahifa (bo'lsa).
  const from =
    (location.state as { from?: string } | null)?.from ?? "/"

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        if (data.succeeded && data.result) {
          navigate(from, { replace: true })
        } else {
          toast.error(data.errors[0] ?? "Tizimga kirishda xatolik yuz berdi")
        }
      },
      onError: () => {
        toast.error("Serverga ulanishda xatolik yuz berdi")
      },
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary p-6">
      {/* Nozik fon nuri — command-center hissi uchun */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative w-full max-w-md space-y-6">
        {/* Emblema va tizim nomi */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-muted-foreground">
            Mudofaa Sanoati Agentligi
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Tizimga kirish</CardTitle>
            <CardDescription>
              Davom etish uchun hisobingizga kiring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="username"
                        placeholder="Loginingizni kiriting"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parol</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Parolingizni kiriting"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {loginMutation.isPending ? "Kirilmoqda..." : "Kirish"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
