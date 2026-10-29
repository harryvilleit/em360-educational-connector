import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses } from "@/hooks/examAndRecords"

interface SessionTermClassSelectProps {
  schoolId: string
  sessionId: string
  onSessionChange: (id: string) => void
  termId: string
  onTermChange: (id: string) => void
  classId?: string
  onClassChange?: (id: string) => void
  showClass?: boolean
  sessionError?: string
  termError?: string
  classError?: string
}

export default function SessionTermClassSelect({
  schoolId,
  sessionId,
  onSessionChange,
  termId,
  onTermChange,
  classId,
  onClassChange,
  showClass = false,
  sessionError,
  termError,
  classError,
}: SessionTermClassSelectProps) {
  const { sessions, isLoading: sessionsLoading } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })
  const { classes: classItems, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 100,
  })

  const termOptions = useMemo(() => {
    const session = sessions.find((s) => s.Id === sessionId)
    return session?.Terms ?? []
  }, [sessions, sessionId])

  function handleSessionChange(id: string) {
    onSessionChange(id)
    onTermChange("")
    onClassChange?.("")
  }

  function handleTermChange(id: string) {
    onTermChange(id)
    onClassChange?.("")
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${showClass ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Session <span className="text-red-500">*</span>
        </Label>
        <Select value={sessionId} onValueChange={handleSessionChange}>
          <SelectTrigger
            className={`w-full rounded-md ${sessionError ? "border-red-400" : "border-gray-200"}`}
          >
            <SelectValue
              placeholder={sessionsLoading ? "Loading..." : "Select session"}
            />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.Id} value={s.Id}>
                {s.SessionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sessionError && <p className="text-xs text-red-500">{sessionError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Term <span className="text-red-500">*</span>
        </Label>
        <Select
          value={termId}
          onValueChange={handleTermChange}
          disabled={!sessionId}
        >
          <SelectTrigger
            className={`w-full rounded-md ${termError ? "border-red-400" : "border-gray-200"}`}
          >
            <SelectValue
              placeholder={!sessionId ? "Select session first" : "Select term"}
            />
          </SelectTrigger>
          <SelectContent>
            {termOptions.map((t) => (
              <SelectItem key={t.Id} value={t.Id}>
                {t.TermName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {termError && <p className="text-xs text-red-500">{termError}</p>}
      </div>

      {showClass && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Class <span className="text-red-500">*</span>
          </Label>
          <Select value={classId} onValueChange={onClassChange}>
            <SelectTrigger
              className={`w-full rounded-md ${classError ? "border-red-400" : "border-gray-200"}`}
            >
              <SelectValue
                placeholder={classesLoading ? "Loading..." : "Select class"}
              />
            </SelectTrigger>
            <SelectContent>
              {classItems.map((c) => (
                <SelectItem key={c.Id} value={c.Id}>
                  {c.ClsName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {classError && <p className="text-xs text-red-500">{classError}</p>}
        </div>
      )}
    </div>
  )
}
