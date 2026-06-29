import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { ProjectDto, ProjectStatus } from "@/types/project"
import { useCreateProject, useUpdateProject } from "@/api/projects"

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "Planned", label: "Rejalashtirilgan" },
  { value: "InProgress", label: "Jarayonda" },
  { value: "Completed", label: "Tugallangan" },
  { value: "Suspended", label: "To'xtatilgan" },
]

const projectSchema = z.object({
  name: z.string().min(1, "Loyiha nomi kiritilishi shart"),
  description: z.string(),
  code: z.string().min(1, "Loyiha kodi kiritilishi shart"),
  client: z.string(),
  deadline: z.string(),
  status: z.enum(["Planned", "InProgress", "Completed", "Suspended"]),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectDto | null
}

function toDateInput(value: string | null): string {
  if (!value) return ""
  return value.slice(0, 10)
}

export default function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(project)
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      client: "",
      deadline: "",
      status: "Planned",
    },
  })

  useEffect(() => {
    if (!open) return
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        code: project.code,
        client: project.client ?? "",
        deadline: toDateInput(project.deadline),
        status: project.status,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        code: "",
        client: "",
        deadline: "",
        status: "Planned",
      })
    }
  }, [open, project, form])

  const onSubmit = (values: ProjectFormValues) => {
    const deadline = values.deadline
      ? new Date(values.deadline).toISOString()
      : null
    const client = values.client.trim() || null

    if (isEdit && project) {
      updateMutation.mutate(
        {
          id: project.id,
          body: {
            name: values.name,
            description: values.description,
            code: values.code,
            client,
            deadline,
            status: values.status,
          },
        },
        {
          onSuccess: (data) => {
            if (data.succeeded) {
              toast.success("Loyiha yangilandi")
              onOpenChange(false)
            } else {
              toast.error(data.errors[0] ?? "Yangilashda xatolik yuz berdi")
            }
          },
          onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
        }
      )
    } else {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description,
          code: values.code,
          client,
          deadline,
        },
        {
          onSuccess: (data) => {
            if (data.succeeded) {
              toast.success("Loyiha qo'shildi")
              onOpenChange(false)
            } else {
              toast.error(data.errors[0] ?? "Qo'shishda xatolik yuz berdi")
            }
          },
          onError: () => toast.error("Serverga ulanishda xatolik yuz berdi"),
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Loyihani tahrirlash" : "Yangi loyiha"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Loyiha ma'lumotlarini yangilang."
              : "Yangi loyiha uchun ma'lumotlarni kiriting."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loyiha nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Loyiha nomi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loyiha kodi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MSA-001"
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tavsif</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Loyiha haqida qisqacha"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyurtmachi</FormLabel>
                    <FormControl>
                      <Input placeholder="Buyurtmachi nomi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Muddat</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holat</FormLabel>
                    {/*
                      key={field.value} forces Radix Select to remount when the
                      value changes externally (e.g. form.reset), so the trigger
                      always shows the correct label and the checkmark lands on
                      the right item.
                    */}
                    <Select
                      key={field.value}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Holatni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saqlanmoqda..."
                  : isEdit
                    ? "Saqlash"
                    : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
