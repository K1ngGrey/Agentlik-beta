import { useEffect, useRef, useState } from "react"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import { MessagesSquare, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/EmptyState"
import ErrorState from "@/components/ErrorState"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import type { ApiResult } from "@/types/api"
import type { ChatMessageDto } from "@/types/chat"

// Global va loyiha chati uchun bitta qayta ishlatiladigan komponent.
// Hook'lar prop orqali beriladi — qaysi API ishlatilishi tashqaridan belgilanadi.
interface ChatBoxProps {
  // Xabarlar ro'yxatini tortib oluvchi query hook (polling ichida).
  useMessages: () => UseQueryResult<ApiResult<ChatMessageDto[]>>
  // Xabar yuboruvchi mutation hook (content -> ApiResult).
  useSendMessage: () => UseMutationResult<
    ApiResult<ChatMessageDto>,
    unknown,
    string
  >
  // Tashqi konteynerga moslash uchun qo'shimcha class (ixtiyoriy).
  className?: string
}

// Vaqtni o'zbekcha qisqa formatda (soat:daqiqa) ko'rsatadi.
function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ChatBox({
  useMessages,
  useSendMessage,
  className,
}: ChatBoxProps) {
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data, isLoading, isError, refetch } = useMessages()
  const sendMutation = useSendMessage()

  const [content, setContent] = useState("")
  // Xabarlar oxiriga avtoskroll uchun nuqta.
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = data?.succeeded ? (data.result ?? []) : []

  // Yangi xabar kelganda yoki yuborilganda pastga skroll qilamiz.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleSend = () => {
    const trimmed = content.trim()
    if (!trimmed || sendMutation.isPending) return

    sendMutation.mutate(trimmed, {
      onSuccess: (result) => {
        if (result.succeeded) {
          setContent("")
        } else {
          toast.error(result.errors[0] ?? "Xabar yuborishda xatolik")
        }
      },
      onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div
      className={cn(
        "flex h-[28rem] flex-col rounded-md border bg-background",
        className
      )}
    >
      {/* Xabarlar ro'yxati */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading && <ChatSkeleton />}

        {!isLoading && isError && (
          <ErrorState
            description="Xabarlarni yuklashda xatolik yuz berdi."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && messages.length === 0 && (
          <EmptyState
            icon={MessagesSquare}
            title="Hali xabarlar yo'q"
            description="Birinchi bo'lib yozing."
          />
        )}

        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId
          return (
            <div
              key={message.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {/* O'z xabaringda ism takrorlanmasin */}
                {!isOwn && (
                  <p className="mb-0.5 text-xs font-medium opacity-80">
                    {message.senderName}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p
                  className={cn(
                    "mt-1 text-right text-[10px]",
                    isOwn
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {formatTime(message.sentAt)}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Xabar yozish maydoni */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Xabar yozing..."
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={!content.trim() || sendMutation.isPending}
        >
          <Send className="h-4 w-4" />
          Yuborish
        </Button>
      </form>
    </div>
  )
}

// Chat xabarlari uchun pufakcha skeletlari (chap/o'ng navbatma-navbat).
function ChatSkeleton() {
  const widths = ["w-40", "w-56", "w-32", "w-48", "w-36"]
  return (
    <div className="space-y-3">
      {widths.map((w, i) => {
        const isOwn = i % 2 === 1
        return (
          <div
            key={i}
            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
          >
            <Skeleton className={cn("h-10 rounded-lg", w)} />
          </div>
        )
      })}
    </div>
  )
}
