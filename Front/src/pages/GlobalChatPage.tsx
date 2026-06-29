import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ChatBox from "@/components/chat/ChatBox"
import PageHeader from "@/components/PageHeader"
import { useGlobalMessages, useSendGlobalMessage } from "@/api/chat"

export default function GlobalChatPage() {
  // Hooks called at the top level — results passed directly as props
  const messagesQuery = useGlobalMessages()
  const sendMutation = useSendGlobalMessage()

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
          />
        </CardContent>
      </Card>
    </div>
  )
}
