import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorState from "@/components/ErrorState"
import ProjectHeader from "@/pages/projects/ProjectHeader"
import ProjectStages from "@/pages/projects/ProjectStages"
import ProjectMembersSidebar from "@/pages/projects/ProjectMembersSidebar"
import ChatBox from "@/components/chat/ChatBox"
import { useProject } from "@/api/projects"
import {
  useProjectMessages,
  useSendProjectMessage,
  useEditMessage,
  useDeleteMessage,
  useTogglePinMessage,
  chatKeys,
} from "@/api/chat"

export default function ProjectDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()

  const projectQuery = useProject(id)
  const project = projectQuery.data?.succeeded ? projectQuery.data.result : null

  // Hooks called unconditionally at the top level — never inside callbacks or conditions
  const messagesQuery = useProjectMessages(id)
  const sendMutation = useSendProjectMessage(id)
  const editMutation = useEditMessage(chatKeys.project(id))
  const deleteMutation = useDeleteMessage(chatKeys.project(id))
  const pinMutation = useTogglePinMessage(chatKeys.project(id))

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => navigate("/projects")}
      >
        <ArrowLeft className="h-4 w-4" />
        Loyihalarga qaytish
      </Button>

      {projectQuery.isLoading && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      )}

      {!projectQuery.isLoading && (projectQuery.isError || !project) && (
        <ErrorState
          title="Loyiha topilmadi"
          description="Loyihani yuklashda xatolik yuz berdi yoki loyiha mavjud emas."
          onRetry={() => projectQuery.refetch()}
        />
      )}

      {!projectQuery.isLoading && project && (
        <>
          <ProjectHeader project={project} />

          <ProjectStages projectId={project.id} />

          <Card>
            <CardHeader>
              <CardTitle>Chat</CardTitle>
              <CardDescription>
                Loyiha bo'yicha muloqot ushbu bo'limda bo'ladi. Chapda loyihaga
                biriktirilgan a'zolar ko'rinadi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid h-[28rem] grid-cols-1 overflow-hidden rounded-md border bg-background sm:grid-cols-[16rem_1fr]">
                <div className="hidden sm:block">
                  <ProjectMembersSidebar projectId={project.id} />
                </div>

                <ChatBox
                  className="h-full rounded-none border-0"
                  messagesQuery={messagesQuery}
                  sendMutation={sendMutation}
                  editMutation={editMutation}
                  deleteMutation={deleteMutation}
                  pinMutation={pinMutation}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
