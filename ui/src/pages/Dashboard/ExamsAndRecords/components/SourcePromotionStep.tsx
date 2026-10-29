import { Layers } from "lucide-react"
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

type SourcePromotionStepProps = {
  sessions: SchoolSessionItem[]
  classes: ClassItem[]
  sourceSessionId: string
  sourceTermId: string
  sourceClassId: string
  sourceArmId: string
  sourceArms: ClassArmItem[]
  sourceSession?: SchoolSessionItem
  onSessionChange: (value: string) => void
  onTermChange: (value: string) => void
  onClassChange: (value: string) => void
  onArmChange: (value: string) => void
}

export function SourcePromotionStep({
  sessions,
  classes,
  sourceSessionId,
  sourceTermId,
  sourceClassId,
  sourceArmId,
  sourceArms,
  sourceSession,
  onSessionChange,
  onTermChange,
  onClassChange,
  onArmChange,
}: SourcePromotionStepProps) {
  return (
    <StepRow
      index={1}
      accent="slate"
      icon={Layers}
      title="Promoting from"
      subtitle="The session, term, and class students are currently enrolled in"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-gray-500">
            Session
          </Label>
          <Select value={sourceSessionId || undefined} onValueChange={onSessionChange}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.Id} value={s.Id}>
                  {s.SessionName}
                  {s.IsCurrent || s.Status === "Active" ? " (Current)" : ""}
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
            value={sourceTermId || undefined}
            onValueChange={onTermChange}
            disabled={!sourceSessionId}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {(sourceSession?.Terms ?? []).map((t) => (
                <SelectItem key={t.Id} value={t.Id}>
                  {t.TermName}
                  {t.IsCurrent ? " (Current)" : ""}
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
          <Select value={sourceClassId || undefined} onValueChange={onClassChange}>
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

        {sourceArms.length > 0 && (
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-gray-500">
              Arm
            </Label>
            <Select value={sourceArmId || undefined} onValueChange={onArmChange}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder="Select arm" />
              </SelectTrigger>
              <SelectContent>
                {sourceArms.map((a) => (
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
