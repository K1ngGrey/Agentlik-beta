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

// Holat tanlovi uchun o'zbekcha matnlar.
const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "Planned", label: "Rejalashtirilgan" },
  { value: "InProgress", label: "Jarayonda" },
  { value: "Completed", label: "Tugallangan" },
  { value: "Suspended", label: "To'xtatilgan" },
]

// Bitta sxema bilan ham yaratish, ham tahrirlashni qoplaymiz.
const projectSchema = z.object({
  name: z.string().min(1, "Loyiha nomi kiritilishi shart"),
  description: z.string(),
  status: z.enum(["Planned", "InProgress", "Completed", "Suspended"]),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // null bo'lsa — yaratish rejimi, aks holda tahrirlash rejimi.
  project: ProjectDto | null
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
      status: "Planned",
    },
  })

  // Dialog ochilganda tanlangan loyihaga mos qiymatlarni yuklaymiz.
  useEffect(() => {
    if (!open) return

    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        status: project.status,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        status: "Planned",
      })
    }
  }, [open, project, form])

  const onSubmit = (values: ProjectFormValues) => {
    if (isEdit && project) {
      updateMutation.mutate(
        {
          id: project.id,
          body: {
            name: values.name,
            description: values.description,
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
      <DialogContent>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tavsif</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Loyiha haqida qisqacha"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Holat tanlovi faqat tahrirlash rejimida ko'rinadi. */}
            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holat</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Holatni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
