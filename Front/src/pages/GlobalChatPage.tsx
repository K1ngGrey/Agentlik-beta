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
  chatKeys,
} from "@/api/chat"

export default function GlobalChatPage() {
  const messagesQuery = useGlobalMessages()
  const sendMutation = useSendGlobalMessage()
  const editMutation = useEditMessage(chatKeys.global)
  const deleteMutation = useDeleteMessage(chatKeys.global)
  const pinMutation = useTogglePinMessage(chatKeys.global)

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
