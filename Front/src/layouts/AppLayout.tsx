import { useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, FolderKanban, MessagesSquare, Users, Menu, LogOut, ChevronDown, ShieldCheck, CircleUser as UserCircle, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Role } from "@/types/auth"
import { useAuthStore } from "@/store/authStore"
import { useLogout } from "@/api/auth"
import { useUnreadCounts } from "@/api/chat"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const SYSTEM_NAME = "Mudofaa Sanoati Agentligi"

const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: "Bosh administrator",
  Rahbar: "Rahbar",
  Member: "A'zo",
}

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  roles?: Role[]
  badgeKey?: "global" | "projects"
}

const NAV_ITEMS: NavItem[] = [
  { label: "Boshqaruv paneli", to: "/", icon: LayoutDashboard },
  { label: "Loyihalar", to: "/projects", icon: FolderKanban, badgeKey: "projects" },
  { label: "Umumiy chat", to: "/chat", icon: MessagesSquare, badgeKey: "global" },
  { label: "Foydalanuvchilar", to: "/users", icon: Users, roles: ["SuperAdmin"] },
]

function visibleNavItems(role: Role | undefined): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  )
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold leading-none text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

interface SidebarNavProps {
  items: NavItem[]
  onNavigate?: () => void
  globalUnread: number
  projectsUnread: number
}

function SidebarNav({ items, onNavigate, globalUnread, projectsUnread }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon
        const badgeCount =
          item.badgeKey === "global"
            ? globalUnread
            : item.badgeKey === "projects"
            ? projectsUnread
            : 0

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
            <UnreadBadge count={badgeCount} />
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: unreadData } = useUnreadCounts()
  const unreadCounts = unreadData?.succeeded ? unreadData.result : null

  const globalUnread = unreadCounts?.globalChatCount ?? 0
  const projectsUnread = unreadCounts
    ? Object.values(unreadCounts.projectChatCounts).reduce((sum, n) => sum + n, 0)
    : 0

  const items = visibleNavItems(user?.role)

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b px-6">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold leading-tight">
            {SYSTEM_NAME}
          </span>
        </div>
        <SidebarNav
          items={items}
          globalUnread={globalUnread}
          projectsUnread={projectsUnread}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Menyuni ochish"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="h-16 justify-center border-b px-6 text-left">
                  <SheetTitle className="flex items-center gap-2.5 text-base leading-tight">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    {SYSTEM_NAME}
                  </SheetTitle>
                </SheetHeader>
                <SidebarNav
                  items={items}
                  onNavigate={() => setMobileOpen(false)}
                  globalUnread={globalUnread}
                  projectsUnread={projectsUnread}
                />
              </SheetContent>
            </Sheet>

            <span className="text-sm font-semibold md:hidden">
              {SYSTEM_NAME}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <span className="max-w-[10rem] truncate text-sm font-medium">
                    {user.fullName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate">{user.fullName}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {ROLE_LABELS[user.role]}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserCircle className="h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    Sozlamalar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isLoggingOut}
                  onSelect={(e) => {
                    e.preventDefault()
                    handleLogout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}
          </div>
        </header>

        {/* Sahifa mazmuni */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
