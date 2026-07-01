import { useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ChatBox from "@/components/chat/ChatBox"
import PageHeader from "@/components/PageHeader"
import {
  useGlobalMessages,
  useSendGlobalMessage,
  useEditMessage,
  useDeleteMessage,
  useTogglePinMessage,
  useMarkChatAsRead,
  chatKeys,
} from "@/api/chat"

export default function GlobalChatPage() {
  const messagesQuery = useGlobalMessages()
  const sendMutation = useSendGlobalMessage()
  const editMutation = useEditMessage(chatKeys.global)
  const deleteMutation = useDeleteMessage(chatKeys.global)
  const pinMutation = useTogglePinMessage(chatKeys.global)
  const markAsReadMutation = useMarkChatAsRead()

  // chatni o'qilgan deb belgilash, agar yangi xabarlar kelib tushsa va biz uni ko'rib turganimizda
  const messages = messagesQuery.data?.succeeded ? messagesQuery.data.result : undefined
  const lastMessageId = messages?.[messages.length - 1]?.id
  const chatId = messages?.[0]?.chatId
  const lastMarkedRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!chatId || !lastMessageId) return
    if (lastMarkedRef.current === lastMessageId) return
    lastMarkedRef.current = lastMessageId
    markAsReadMutation.mutate(chatId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, lastMessageId])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Umumiy chat"
        description="Barcha foydalanuvchilar uchun umumiy muloqot maydoni."
      />

      <Card>
        <CardHeader>
          <CardTitle>Xabarlar</CardTitle>
          <CardDescription>
            Xabarlar har bir necha soniyada avtomatik yangilanadi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatBox
            className="h-[32rem]"
            messagesQuery={messagesQuery}
            sendMutation={sendMutation}
            editMutation={editMutation}
            deleteMutation={deleteMutation}
            pinMutation={pinMutation}
          />
        </CardContent>
      </Card>
    </div>
  )
}