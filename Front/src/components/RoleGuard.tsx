import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Role } from "@/types/auth"
import { useAuthStore } from "@/store/authStore"

interface RoleGuardProps {
  // Ruxsat berilgan rollar. Bo'sh/berilmagan bo'lsa — barcha kirgan foydalanuvchiga ochiq.
  roles?: Role[]
  children: ReactNode
}

// Foydalanuvchining roli ruxsat etilganlar ro'yxatida bo'lmasa,
// "Ruxsat yo'q" sahifasini ko'rsatadi.
export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  const isAllowed = !roles || roles.length === 0 || (user && roles.includes(user.role))

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Ruxsat yo'q</CardTitle>
            <CardDescription>
              Sizda ushbu sahifani ko'rish uchun yetarli huquq mavjud emas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.history.back()}>
              Ortga qaytish
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
