import { GraduationCap } from "lucide-react"
import type { ClassItem, ClassArmItem } from "@/api/examAndRecords.api/types"
import type { SchoolSessionItem } from "@/api/userMgt.api/types"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StepRow } from "./StepRow"

type DestinationPromotionStepProps = {
  sessions: SchoolSessionItem[]
  classes: ClassItem[]
  targetSessionId: string
  targetTermId: string
  targetClassId: string
  targetArmId: string
  targetArms: ClassArmItem[]
  targetSession?: SchoolSessionItem
  onSessionChange: (value: string) => void
  onTermChange: (value: string) => void
  onClassChange: (value: string) => void
  onArmChange: (value: string) => void
}

export function DestinationPromotionStep({
  sessions,
  classes,
  targetSessionId,
  targetTermId,
  targetClassId,
  targetArmId,
  targetArms,
  targetSession,
  onSessionChange,
  onTermChange,
  onClassChange,
  onArmChange,
}: DestinationPromotionStepProps) {
  return (
    <StepRow
      index={3}
      isLast
      accent="blue"
      icon={GraduationCap}
      title="Promoting to"
      subtitle="The destination session, term, and class"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-gray-500">
            Session
          </Label>
          <Select value={targetSessionId || undefined} onValueChange={onSessionChange}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.Id} value={s.Id}>
                  {s.SessionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs font-medium text-gray-500">
            Term
          </Label>
          <Select
            value={targetTermId || undefined}
            onValueChange={onTermChange}
            disabled={!targetSessionId}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {(targetSession?.Terms ?? []).map((t) => (
                <SelectItem key={t.Id} value={t.Id}>
                  {t.TermName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-gray-500">
            Class
          </Label>
          <Select value={targetClassId || undefined} onValueChange={onClassChange}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.Id} value={c.Id}>
                  {c.ClsName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {targetArms.length > 0 && (
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-gray-500">
              Arm
            </Label>
            <Select value={targetArmId || undefined} onValueChange={onArmChange}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder="Select arm" />
              </SelectTrigger>
              <SelectContent>
                {targetArms.map((a) => (
                  <SelectItem key={a.Id} value={a.Id}>
                    {a.ArmName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </StepRow>
  )
}
