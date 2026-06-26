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
            useMessages={useGlobalMessages}
            useSendMessage={useSendGlobalMessage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
