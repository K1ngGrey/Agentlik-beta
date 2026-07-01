import { useNavigate } from "react-router-dom"
import {
  Bell,
  CheckCheck,
  MessageSquare,
  UserCheck,
  Activity,
  Clock,
  BellOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { NotificationDto, NotificationType } from "@/types/notification"
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/api/notifications"

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  StageStatusChanged: Activity,
  StageAssigned: UserCheck,
  NewChatMessage: MessageSquare,
  DeadlineApproaching: Clock,
}

function relativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return "Hozirgina"
  if (mins < 60) return `${mins} daqiqa oldin`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  return `${days} kun oldin`
}

interface NotificationItemProps {
  notification: NotificationDto
  onRead: (id: string) => void
  onNavigate: (projectId: string | null) => void
}

function NotificationItem({ notification, onRead, onNavigate }: NotificationItemProps) {
  const Icon = TYPE_ICON[notification.type] ?? Bell

  const handleClick = () => {
    if (!notification.isRead) onRead(notification.id)
    onNavigate(notification.relatedProjectId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          notification.isRead
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", !notification.isRead && "font-semibold")}>
          {notification.title}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/70 tabular-nums">
          {relativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}

export default function NotificationBell() {
  const navigate = useNavigate()

  const { data: countData } = useUnreadNotificationCount()
  const { data: listData } = useNotifications()

  const markOne = useMarkNotificationAsRead()
  const markAll = useMarkAllNotificationsAsRead()

  const unreadCount = countData?.succeeded ? (countData.result ?? 0) : 0
  const notifications = listData?.succeeded ? (listData.result ?? []) : []
  const recent = notifications.slice(0, 10)

  const handleNavigate = (projectId: string | null) => {
    if (projectId) navigate(`/projects/${projectId}`)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Bildirishnomalar">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Bildirishnomalar</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Barchasini o'qilgan deb belgilash
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[360px] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Bildirishnomalar yo'q
              </p>
            </div>
          ) : (
            <div className="py-1">
              {recent.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={(id) => markOne.mutate(id)}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
