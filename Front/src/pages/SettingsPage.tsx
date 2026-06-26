import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Settings as SettingsIcon, Info } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import PageHeader from "@/components/PageHeader"
import { useAuthStore } from "@/store/authStore"
import type { Role } from "@/types/auth"

const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: "Bosh administrator",
  Rahbar: "Rahbar",
  Member: "A'zo",
}

interface ThemeOption {
  value: "light" | "dark" | "system"
  label: string
  icon: typeof Sun
  description: string
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Yorug'",
    icon: Sun,
    description: "Yorug' mavzu",
  },
  {
    value: "dark",
    label: "Tungi",
    icon: Moon,
    description: "Tungi mavzu",
  },
  {
    value: "system",
    label: "Tizim",
    icon: Monitor,
    description: "Tizim sozlamasiga moslash",
  },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sozlamalar"
        description="Tizim sozlamalarini boshqaring."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mavzu sozlamalari */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              Mavzu
            </CardTitle>
            <CardDescription>
              Tizim ko'rinishini o'zingizga moslang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                const isActive = theme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hisob ma'lumotlari */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              Hisob ma'lumotlari
            </CardTitle>
            <CardDescription>
              Sizning tizimdagi hisobingiz haqida ma'lumot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-3">
                <InfoRow label="F.I.Sh" value={user.fullName} />
                <InfoRow label="Login" value={user.login} />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rol</span>
                  <Badge variant="secondary">
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Holat</span>
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
            ) : (
              <p className="text-sm text-muted-foreground">
                Ma'lumotlar yuklanmoqda...
              </p>
            )}

            <div className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="/profile">Profilni tahrirlash</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
