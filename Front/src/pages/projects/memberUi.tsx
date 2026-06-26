import { cn } from "@/lib/utils"
import type { Role } from "@/types/auth"

// Rol nomlarini o'zbekcha ko'rsatish uchun.
export const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: "Bosh administrator",
  Rahbar: "Rahbar",
  Member: "A'zo",
}

// Ismdan bosh harflarni (maksimum 2 ta) ajratib oladi.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// Ism asosida barqaror rang tanlash uchun palitra.
const AVATAR_COLORS = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
]

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash]
}

interface MemberAvatarProps {
  name: string
  className?: string
}

// Ism bosh harflaridan iborat doiraviy avatar.
export function MemberAvatar({ name, className }: MemberAvatarProps) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        colorFor(name),
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
