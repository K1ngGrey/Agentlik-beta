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
import { useProjectMessages, useSendProjectMessage } from "@/api/chat"

export default function ProjectDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useProject(id)
  const project = data?.succeeded ? data.result : null

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

      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      )}

      {!isLoading && (isError || !project) && (
        <ErrorState
          title="Loyiha topilmadi"
          description="Loyihani yuklashda xatolik yuz berdi yoki loyiha mavjud emas."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && project && (
        <>
          {/* Boy sarlavha: kod, nom, status, mijoz/muddat, progress, sanoq */}
          <ProjectHeader project={project} />

          {/* Bosqichlar bo'limi */}
          <ProjectStages projectId={project.id} />

          {/* Chat bo'limi — Telegram uslubida: chapda a'zolar, o'ngda suhbat */}
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
                {/* Chap panel — a'zolar (kichik ekranda yashiriladi) */}
                <div className="hidden sm:block">
                  <ProjectMembersSidebar projectId={project.id} />
                </div>

                {/* O'ng panel — suhbat */}
                <ChatBox
                  className="h-full rounded-none border-0"
                  useMessages={() => useProjectMessages(project.id)}
                  useSendMessage={() => useSendProjectMessage(project.id)}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
