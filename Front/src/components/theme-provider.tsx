import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

// next-themes ustidan nozik o'ram — butun ilovani bitta joydan boshqaramiz.
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="msa-theme"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
