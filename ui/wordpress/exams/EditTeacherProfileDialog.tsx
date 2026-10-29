// Edits a teacher's school employment details (qualification and employment type),
// saved through the WordPress gateway's school-bound staff profile operation.
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import apiClient from "@/api/api"
import type { TeacherDetailsValueI } from "@/api/examAndRecords.api/types"
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
import { Label } from "@/components/ui/label"
import { normalizeResponse } from "@/utils/apiResponse"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: TeacherDetailsValueI
  schoolId: string
}

export default function EditTeacherProfileDialog({ open, onOpenChange, teacher, schoolId }: Props) {
  const [qualification, setQualification] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const client = useQueryClient()
  useEffect(() => {
    if (open) {
      setQualification(teacher.qualification ?? "")
      setEmploymentType(teacher.employmentType ?? "")
    }
  }, [open, teacher])
  const save = useMutation({
    mutationFn: async () => {
      const result = normalizeResponse<{ isSuccess: boolean; message?: string }>(
        await apiClient.put("/SubUser/UpdateStaffProfile", {
          schoolId,
          productUserSubUserId: teacher.productUserSubUserId,
          qualification,
          employmentType,
        }),
      )
      if (!result.isSuccess) throw new Error(result.message || "Unable to save teacher profile")
    },
    onSuccess: async () => {
      await client.invalidateQueries()
      onOpenChange(false)
      toast.success("Teacher profile saved")
    },
  })
  return (
    <Dialog open={open} onOpenChange={(next) => save.isPending || onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Teacher Profile</DialogTitle>
          <DialogDescription>Update this teacher’s school employment details.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <p className="text-sm">
            {teacher.firstName} {teacher.lastName} · {teacher.email}
          </p>
          <div className="space-y-2">
            <Label htmlFor="teacher-qualification">Qualification</Label>
            <Input
              id="teacher-qualification"
              value={qualification}
              maxLength={500}
              onChange={(e) => setQualification(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher-employment">Employment type</Label>
            <Input
              id="teacher-employment"
              value={employmentType}
              maxLength={100}
              onChange={(e) => setEmploymentType(e.target.value)}
              placeholder="Full-time, part-time or contract"
            />
          </div>
          {save.error && (
            <p role="alert" className="text-red-700">
              {save.error.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={save.isPending} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
