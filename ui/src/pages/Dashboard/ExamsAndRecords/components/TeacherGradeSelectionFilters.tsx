import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SessionTerm {
  Id: string
  TermName: string
  IsCurrent?: boolean
}

interface SessionOption {
  Id: string
  SessionName: string
  Terms: SessionTerm[]
}

interface ClassOption {
  classId: string
  className: string
}

interface SubjectOption {
  subjectId: string
  subjectName: string
}

interface TeacherGradeSelectionFiltersProps {
  sessions: SessionOption[]
  selectedSessionId: string
  selectedTermId: string
  selectedClassId: string
  selectedSubjectId: string
  selectedSession?: SessionOption
  classes: ClassOption[]
  subjects: SubjectOption[]
  classesLoading: boolean
  subjectsLoading: boolean
  onSessionChange: (sessionId: string) => void
  onTermChange: (termId: string) => void
  onClassChange: (classId: string) => void
  onSubjectChange: (subjectId: string) => void
}

export function TeacherGradeSelectionFilters({
  sessions,
  selectedSessionId,
  selectedTermId,
  selectedClassId,
  selectedSubjectId,
  selectedSession,
  classes,
  subjects,
  classesLoading,
  subjectsLoading,
  onSessionChange,
  onTermChange,
  onClassChange,
  onSubjectChange,
}: TeacherGradeSelectionFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Select Class & Subject
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Session</label>
            <Select value={selectedSessionId} onValueChange={onSessionChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.Id} value={session.Id}>
                    {session.SessionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Term</label>
            <Select
              value={selectedTermId}
              onValueChange={onTermChange}
              disabled={!selectedSessionId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {selectedSession?.Terms.map((term) => (
                  <SelectItem key={term.Id} value={term.Id}>
                    {term.TermName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Class</label>
            <Select value={selectedClassId} onValueChange={onClassChange}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={classesLoading ? "Loading…" : "Select class"}
                />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.classId} value={classItem.classId}>
                    {classItem.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Subject</label>
            <Select
              value={selectedSubjectId}
              onValueChange={onSubjectChange}
              disabled={!selectedClassId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={subjectsLoading ? "Loading…" : "Select subject"}
                />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
