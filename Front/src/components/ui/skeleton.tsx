import { cn } from "@/lib/utils"

// Yuklanish paytida kontent o'rnida ko'rinadigan pulsatsiyali plaster.
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
