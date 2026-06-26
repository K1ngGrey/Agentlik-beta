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
import type { StageDto, StageStatus } from "@/types/stage"
import { useCreateStage, useUpdateStage } from "@/api/stages"

// Holat tanlovi uchun o'zbekcha matnlar.
const STATUS_OPTIONS: { value: StageStatus; label: string }[] = [
  { value: "NotStarted", label: "Boshlanmagan" },
  { value: "InProgress", label: "Jarayonda" },
  { value: "Completed", label: "Tugallangan" },
]

// Bitta sxema bilan ham yaratish, ham tahrirlashni qoplaymiz.
const stageSchema = z.object({
  name: z.string().min(1, "Bosqich nomi kiritilishi shart"),
  description: z.string(),
  order: z.coerce
    .number({ invalid_type_error: "Tartib raqami kiritilishi shart" })
    .int("Tartib butun son bo'lishi kerak")
    .min(0, "Tartib manfiy bo'lishi mumkin emas"),
  status: z.enum(["NotStarted", "InProgress", "Completed"]),
  startDate: z.string(),
  endDate: z.string(),
})

type StageFormValues = z.infer<typeof stageSchema>

// ISO sanani <input type="date"> uchun "yyyy-mm-dd" ko'rinishiga keltiradi.
function toDateInput(value: string | null): string {
  if (!value) return ""
  return value.slice(0, 10)
}

// Bo'sh sana — null, aks holda ISO ko'rinishida yuboramiz.
function fromDateInput(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

interface StageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  // null bo'lsa — yaratish rejimi, aks holda tahrirlash rejimi.
  stage: StageDto | null
  // Yangi bosqich uchun taklif qilinadigan tartib raqami.
  nextOrder: number
}

export default function StageFormDialog({
  open,
  onOpenChange,
  projectId,
  stage,
  nextOrder,
}: StageFormDialogProps) {
  const isEdit = Boolean(stage)
  const createMutation = useCreateStage(projectId)
  const updateMutation = useUpdateStage(projectId)
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: "",
      description: "",
      order: nextOrder,
      status: "NotStarted",
      startDate: "",
      endDate: "",
    },
  })

  // Dialog ochilganda tanlangan bosqichga mos qiymatlarni yuklaymiz.
  useEffect(() => {
    if (!open) return

    if (stage) {
      form.reset({
        name: stage.name,
        description: stage.description,
        order: stage.order,
        status: stage.status,
        startDate: toDateInput(stage.startDate),
        endDate: toDateInput(stage.endDate),
      })
    } else {
      form.reset({
        name: "",
        description: "",
        order: nextOrder,
        status: "NotStarted",
        startDate: "",
        endDate: "",
      })
    }
  }, [open, stage, nextOrder, form])

  const onSubmit = (values: StageFormValues) => {
    if (isEdit && stage) {
      updateMutation.mutate(
        {
          id: stage.id,
          body: {
            name: values.name,
            description: values.description,
            order: values.order,
            status: values.status,
            startDate: fromDateInput(values.startDate),
            endDate: fromDateInput(values.endDate),
          },
        },
        {
          onSuccess: (data) => {
            if (data.succeeded) {
              toast.success("Bosqich yangilandi")
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
          order: values.order,
        },
        {
          onSuccess: (data) => {
            if (data.succeeded) {
              toast.success("Bosqich qo'shildi")
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
            {isEdit ? "Bosqichni tahrirlash" : "Yangi bosqich"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Bosqich ma'lumotlarini yangilang."
              : "Yangi bosqich uchun ma'lumotlarni kiriting."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bosqich nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Bosqich nomi" {...field} />
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
                      placeholder="Bosqich haqida qisqacha"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tartib raqami</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Holat va sanalar faqat tahrirlash rejimida ko'rinadi. */}
            {isEdit && (
              <>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Boshlanish sanasi</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tugash sanasi</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
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
