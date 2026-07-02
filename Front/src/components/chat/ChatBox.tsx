import { useEffect, useRef, useState } from "react"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import {
  MessagesSquare,
  Send,
  Paperclip,
  Smile,
  X,
  FileText,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react"
import { toast } from "sonner"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import EmojiPicker from "@/components/chat/EmojiPicker"
import EmptyState from "@/components/EmptyState"
import ErrorState from "@/components/ErrorState"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import type { ApiResult } from "@/types/api"
import type { ChatMessageDto } from "@/types/chat"

interface ChatBoxProps {
  messagesQuery: UseQueryResult<ApiResult<ChatMessageDto[]>>
  sendMutation: UseMutationResult<ApiResult<ChatMessageDto>, unknown, string>
  editMutation: UseMutationResult<
    ApiResult<ChatMessageDto>,
    unknown,
    { id: string; content: string }
  >
  deleteMutation: UseMutationResult<ApiResult<boolean>, unknown, string>
  pinMutation: UseMutationResult<ApiResult<ChatMessageDto>, unknown, string>
  className?: string
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface MessageGroup {
  senderId: string
  senderName: string
  isOwn: boolean
  messages: ChatMessageDto[]
}

function groupMessages(
  messages: ChatMessageDto[],
  currentUserId: string | undefined
): MessageGroup[] {
  const groups: MessageGroup[] = []
  for (const msg of messages) {
    const isOwn = msg.senderId === currentUserId
    const last = groups[groups.length - 1]
    if (last && last.senderId === msg.senderId) {
      last.messages.push(msg)
    } else {
      groups.push({ senderId: msg.senderId, senderName: msg.senderName, isOwn, messages: [msg] })
    }
  }
  return groups
}

interface AttachedFile {
  file: File
  previewUrl: string | null
}

function parseFile(msg: string) {
  const m = msg.match(/^\[Fayl: (.+?) \((.+?)\)\]([\s\S]*)$/)
  if (m) return { fileName: m[1], fileSize: m[2], text: m[3].trim() }
  return null
}

// bubble context menu edit, pin va delete tugmalari uchun
interface BubbleMenuProps {
  message: ChatMessageDto
  isOwn: boolean
  isSuperAdmin: boolean
  onEdit: () => void
  onDelete: () => void
  onPin: () => void
  isPending: boolean
}

function BubbleMenu({ message, isOwn, isSuperAdmin, onEdit, onDelete, onPin, isPending }: BubbleMenuProps) {
  const canEdit = isOwn
  const canDelete = isOwn || isSuperAdmin
  const canPin = isOwn || isSuperAdmin

  if (!canEdit && !canDelete && !canPin) return null

  return (
    <div
      className={cn(
        "absolute -top-8 flex items-center gap-0.5 rounded-lg border bg-popover px-1 py-0.5 shadow-md z-10",
        // hover holatida ko'rsatish, aks holda yashirish
        "opacity-0 pointer-events-none",
        "group-hover/bubble:opacity-100 group-hover/bubble:pointer-events-auto",
        "transition-opacity duration-150",
        "group-hover/bubble:[transition-delay:0ms] [transition-delay:400ms]",
        isOwn ? "right-0" : "left-0"
      )}
    >
      {canPin && (
        <button
          type="button"
          disabled={isPending}
          onClick={onPin}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          title={message.isPinned ? "Mahkamlashni bekor qilish" : "Mahkamlash"}
        >
          {message.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
      )}
      {canEdit && (
        <button
          type="button"
          disabled={isPending}
          onClick={onEdit}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Tahrirlash"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          disabled={isPending}
          onClick={onDelete}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="O'chirish"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

interface ReadStatusIndicatorProps {
  readByCount: number
  totalParticipants: number
}

function ReadStatusIndicator({ readByCount, totalParticipants }: ReadStatusIndicatorProps) {
  // totalParticipants includes sender, so readers = totalParticipants - 1
  const totalReaders = Math.max(0, totalParticipants - 1)

  // No indicators needed if:
  // - No other participants (totalReaders === 0)
  // - totalParticipants is 0 (not set / legacy)
  if (totalReaders === 0 || totalParticipants === 0) return null

  const allRead = readByCount >= totalReaders
  const someRead = readByCount > 0

  // One gray check = sent but not yet read by anyone
  // Two gray checks = read by at least one person but not all
  // Two blue checks = read by everyone

  if (!someRead) {
    // Single gray check - sent, not yet read
    return <Check className="h-3 w-3" />
  }

  if (!allRead) {
    // Two gray checks - read by some but not all
    return <CheckCheck className="h-3 w-3" />
  }

  // Two blue checks - read by all
  return <CheckCheck className="h-3 w-3 text-sky-400" />
}

export default function ChatBox({
  messagesQuery,
  sendMutation,
  editMutation,
  deleteMutation,
  pinMutation,
  className,
}: ChatBoxProps) {
  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id
  const isSuperAdmin = user?.role === "SuperAdmin"

  const { data, isLoading, isError, refetch } = messagesQuery

  const [content, setContent] = useState("")
  const [attached, setAttached] = useState<AttachedFile | null>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const rawMessages = data?.succeeded ? (data.result ?? []) : []
  // Keep chronological order — pinned messages stay in place (like Telegram)
  const messages = [...rawMessages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  )
  const groups = groupMessages(messages, currentUserId)

  const pinnedMessages = rawMessages.filter((m) => m.isPinned)
  const pinnedCount = pinnedMessages.length

  // Ref map for scrolling to a pinned message by id
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Cycle through pinned messages on banner click (like Telegram)
  const pinnedIndexRef = useRef(0)
  const scrollToPinned = () => {
    if (pinnedMessages.length === 0) return
    pinnedIndexRef.current = (pinnedIndexRef.current) % pinnedMessages.length
    const target = pinnedMessages[pinnedIndexRef.current]
    pinnedIndexRef.current = (pinnedIndexRef.current + 1) % pinnedMessages.length
    const el = messageRefs.current.get(target.id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [content])

  useEffect(() => {
    if (editingId) {
      editTextareaRef.current?.focus()
    }
  }, [editingId])

  const handleSend = () => {
    const trimmed = content.trim()
    if ((!trimmed && !attached) || sendMutation.isPending) return

    const payload = attached
      ? trimmed
        ? `[Fayl: ${attached.file.name} (${formatFileSize(attached.file.size)})] ${trimmed}`
        : `[Fayl: ${attached.file.name} (${formatFileSize(attached.file.size)})]`
      : trimmed

    sendMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.succeeded) {
          setContent("")
          setAttached(null)
        } else {
          toast.error(result.errors[0] ?? "Xabar yuborishda xatolik")
        }
      },
      onError: () => toast.error("Serverga ulanishda xatolik"),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    setAttached({ file, previewUrl })
    e.target.value = ""
  }

  const handleEmojiSelect = (emoji: string) => {
    const el = textareaRef.current
    if (el) {
      const start = el.selectionStart ?? content.length
      const end = el.selectionEnd ?? content.length
      const next = content.slice(0, start) + emoji + content.slice(end)
      setContent(next)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(start + emoji.length, start + emoji.length)
      })
    } else {
      setContent((c) => c + emoji)
    }
    setEmojiOpen(false)
  }

  const startEdit = (msg: ChatMessageDto) => {
    setEditingId(msg.id)
    setEditContent(msg.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const submitEdit = (id: string) => {
    const trimmed = editContent.trim()
    if (!trimmed || editMutation.isPending) return

    editMutation.mutate(
      { id, content: trimmed },
      {
        onSuccess: (result) => {
          if (result.succeeded) {
            cancelEdit()
          } else {
            toast.error(result.errors[0] ?? "Tahrirlashda xatolik")
          }
        },
        onError: () => toast.error("Serverga ulanishda xatolik"),
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: (result) => {
        if (!result.succeeded) {
          toast.error(result.errors[0] ?? "O'chirishda xatolik")
        }
      },
      onError: () => toast.error("Serverga ulanishda xatolik"),
    })
  }

  const handlePin = (id: string) => {
    pinMutation.mutate(id, {
      onSuccess: (result) => {
        if (!result.succeeded) {
          toast.error(result.errors[0] ?? "Mahkamlashda xatolik")
        }
      },
      onError: () => toast.error("Serverga ulanishda xatolik"),
    })
  }

  const actionPending =
    editMutation.isPending || deleteMutation.isPending || pinMutation.isPending

  const canSend = Boolean((content.trim() || attached) && !sendMutation.isPending)

  return (
    <div className={cn("flex flex-col bg-background overflow-hidden", className)}>
      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {/* Pinned banner — sticky inside scroll area, clicks scroll to the pinned message */}
        {pinnedCount > 0 && (
          <button
            type="button"
            onClick={scrollToPinned}
            className="sticky top-0 z-10 flex w-full items-center gap-2 rounded-lg border border-amber-200/60 bg-amber-50/90 px-3 py-1.5 text-xs text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100/90 dark:hover:bg-amber-900/50 transition-colors text-left backdrop-blur-sm"
          >
            <Pin className="h-3 w-3 shrink-0" />
            <span className="flex-1">{pinnedCount} ta mahkamlangan xabar</span>
            <span className="text-[10px] opacity-60">↑ o'tish</span>
          </button>
        )}
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

        {groups.map((group, gi) => (
          <div
            key={`${group.senderId}-${gi}`}
            className={cn(
              "flex w-full flex-col gap-0.5",
              group.isOwn ? "items-end" : "items-start"
            )}
          >
            {!group.isOwn && (
              <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                {group.senderName}
              </span>
            )}
            {group.messages.map((message, mi) => {
              const isLast = mi === group.messages.length - 1
              const isEditing = editingId === message.id
              const parsed = parseFile(message.content)

              return (
                <div
                  key={message.id}
                  ref={(el) => {
                    if (el) messageRefs.current.set(message.id, el)
                    else messageRefs.current.delete(message.id)
                  }}
                  className="relative group/bubble max-w-[70%]"
                >
                  <BubbleMenu
                    message={message}
                    isOwn={group.isOwn}
                    isSuperAdmin={isSuperAdmin}
                    onEdit={() => startEdit(message)}
                    onDelete={() => handleDelete(message.id)}
                    onPin={() => handlePin(message.id)}
                    isPending={actionPending}
                  />

                  {isEditing ? (
                    /* Inline edit mode */
                    <div className="flex min-w-[200px] max-w-[70%] flex-col gap-1 rounded-xl border bg-background p-2 shadow-sm">
                      <textarea
                        ref={editTextareaRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            submitEdit(message.id)
                          }
                          if (e.key === "Escape") cancelEdit()
                        }}
                        rows={2}
                        className="w-full resize-none rounded bg-transparent text-sm focus:outline-none"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => submitEdit(message.id)}
                          disabled={!editContent.trim() || editMutation.isPending}
                          className="flex h-5 w-5 items-center justify-center rounded text-primary hover:opacity-80 disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "relative w-full",
                        group.isOwn
                          ? cn("rounded-[14px] rounded-br-[4px]", !isLast && "rounded-br-[14px]")
                          : cn("rounded-[14px] rounded-bl-[4px]", !isLast && "rounded-bl-[14px]"),
                        group.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                        message.isPinned && "ring-1 ring-amber-400/60"
                      )}
                      style={{ paddingTop: 7, paddingBottom: 4, paddingLeft: 12, paddingRight: 12 }}
                    >
                      {message.isPinned && (
                        <Pin className="mb-0.5 inline h-2.5 w-2.5 text-amber-500 mr-1" />
                      )}

                      {parsed ? (
                        <div className="space-y-1.5 mb-1">
                          <div
                            className={cn(
                              "flex items-center gap-2 rounded-lg p-2",
                              group.isOwn ? "bg-primary-foreground/10" : "bg-background/60"
                            )}
                          >
                            <FileText className="h-6 w-6 shrink-0 opacity-70" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium leading-tight">{parsed.fileName}</p>
                              <p className="text-xs opacity-60">{parsed.fileSize}</p>
                            </div>
                          </div>
                          {parsed.text && (
                            <p className="whitespace-pre-wrap text-sm leading-snug break-words">{parsed.text}</p>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-snug break-words">{message.content}</p>
                      )}

                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 select-none",
                          group.isOwn ? "text-primary-foreground/50" : "text-muted-foreground"
                        )}
                      >
                        {message.isEdited && (
                          <span className="text-[10px] italic leading-none">tahrirlangan</span>
                        )}
                        <span className="text-[10px] leading-none tabular-nums">
                          {formatTime(message.sentAt)}
                        </span>
                        {/* Read status indicators for own messages */}
                        {group.isOwn && (
                          <ReadStatusIndicator
                            readByCount={message.readByCount}
                            totalParticipants={message.totalParticipants}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Attachment preview */}
      {attached && (
        <div className="mx-4 mb-1 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
          {attached.previewUrl ? (
            <img src={attached.previewUrl} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <FileText className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{attached.file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(attached.file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => setAttached(null)}
            className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input toolbar */}
      <div className="flex items-end gap-1.5 border-t px-3 py-2.5">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Fayl biriktirish"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Fayl biriktirish"
        >
          <Paperclip className="h-[18px] w-[18px]" />
        </button>

        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Emoji"
            >
              <Smile className="h-[18px] w-[18px]" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-2">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </PopoverContent>
        </Popover>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Xabar yozing..."
          rows={1}
          autoComplete="off"
          className={cn(
            "flex-1 resize-none rounded-2xl border bg-muted/50 px-3.5 py-2 text-sm leading-snug",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "max-h-[120px] overflow-y-auto"
          )}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-150",
            canSend
              ? "bg-primary text-primary-foreground shadow-md hover:scale-105 hover:shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          title="Yuborish"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function ChatSkeleton() {
  const items = [
    { side: "start", w: "w-40" },
    { side: "end", w: "w-56" },
    { side: "start", w: "w-32" },
    { side: "end", w: "w-48" },
    { side: "start", w: "w-36" },
  ]
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className={cn("flex", item.side === "end" ? "justify-end" : "justify-start")}>
          <Skeleton className={cn("h-9 rounded-2xl", item.w)} />
        </div>
      ))}
    </div>
  )
}