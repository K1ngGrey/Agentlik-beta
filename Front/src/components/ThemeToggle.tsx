import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Yorug'/Tungi/Tizim mavzularini almashtirish tugmasi.
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mavzuni o'zgartirish"
          className="relative"
        >
          {/* Yorug'da quyosh, tungida oy ko'rinadi (CSS orqali almashadi). */}
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="h-4 w-4" />
          Yorug'
          {theme === "light" && <span className="ml-auto text-xs">•</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="h-4 w-4" />
          Tungi
          {theme === "dark" && <span className="ml-auto text-xs">•</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <Monitor className="h-4 w-4" />
          Tizim
          {theme === "system" && <span className="ml-auto text-xs">•</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
