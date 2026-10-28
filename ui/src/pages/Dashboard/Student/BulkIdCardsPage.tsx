import { useRef, useState } from "react"
import { ChevronDown, IdCard, Printer, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSchoolClassOptions } from "@/hooks/useSchoolClassOptions"
import { useSchoolCardBranding } from "@/hooks/useSchoolCardBranding"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { fetchClassStudentDirectory } from "@/lib/schoolStudentDirectory"
import { idCardIssuedDate, type SchoolIdCard } from "@/lib/idCards"
import { printIdCards } from "@/lib/printIdCards"
import IdCardPreview from "@/components/id-cards/IdCardPreview"
import CardSelectionList from "@/components/id-cards/CardSelectionList"
import StaffIdCardsPanel from "@/pages/Dashboard/StaffManagement/StaffIdCardsPanel"

function StudentIdCardsPanel() {
  const schoolId = useSchoolId()
  const { classes, isLoading: classesLoading, isError: classesError, error: classError } =
    useSchoolClassOptions(schoolId)
  const { branding, isLoading: brandingLoading } = useSchoolCardBranding(
    schoolId,
    { enabled: true, contactEnabled: true }
  )
  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const currentSessionName =
    sessions.find((s) => s.Terms.some((t) => t.IsCurrent))?.SessionName ??
    sessions[0]?.SessionName

  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    new Set()
  )
  const [cards, setCards] = useState<SchoolIdCard[]>([])
  const [generating, setGenerating] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const preview = useRef<HTMLDivElement>(null)
  const selectedCards = cards.filter((card) => selectedIds.has(card.personId))

  const allSelected =
    classes.length > 0 && selectedClassIds.size === classes.length

  const selectedLabel =
    selectedClassIds.size === 0
      ? "Select classes"
      : allSelected
        ? "All classes (entire school)"
        : selectedClassIds.size <= 2
          ? classes
              .filter((cls) => selectedClassIds.has(cls.Id))
              .map((cls) => cls.ClsName)
              .join(", ")
          : `${selectedClassIds.size} classes selected`

  function toggleClass(id: string) {
    setGenerateError(null)
    setSelectedClassIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setGenerateError(null)
    setSelectedClassIds(
      allSelected ? new Set() : new Set(classes.map((cls) => cls.Id))
    )
  }

  async function generate() {
    if (!branding || selectedClassIds.size === 0) return
    setGenerating(true)
    setGenerateError(null)
    setCards([])
    try {
      const targetClasses = classes.filter((cls) =>
        selectedClassIds.has(cls.Id)
      )
      const issuedOn = idCardIssuedDate()
      const rosters = await Promise.all(
        targetClasses.map((cls) =>
          fetchClassStudentDirectory(schoolId, cls.Id, cls.ClsName)
        )
      )
      const nextCards: SchoolIdCard[] = rosters.flat().map((student) => ({
        kind: "student",
        schoolId,
        schoolName: branding.schoolName,
        schoolLogo: branding.schoolLogo,
        schoolPhone: branding.schoolPhone,
        schoolEmail: branding.schoolEmail,
        schoolAddress: branding.schoolAddress,
        personId: student.studentId,
        displayId: student.studentGivenId || student.studentId,
        name: student.fullName,
        photo: student.profilePicture ?? undefined,
        className: student.className,
        session: currentSessionName,
        issuedOn,
      }))
      if (!nextCards.length)
        setGenerateError("No students were found in the selected classes.")
      setCards(nextCards)
      setSelectedIds(new Set(nextCards.map((card) => card.personId)))
    } catch (error) {
      setGenerateError(
        error instanceof Error
          ? error.message
          : "Could not load students for the selected classes."
      )
    } finally {
      setGenerating(false)
    }
  }

  async function print() {
    if (!preview.current || !selectedCards.length) return
    setPrinting(true)
    try {
      // QR codes render asynchronously per card; give the last ones a moment
      // to finish before printIdCards checks that every card is ready.
      for (let attempt = 0; attempt < 40; attempt++) {
        try {
          await printIdCards(preview.current)
          return
        } catch (error) {
          const notReady =
            error instanceof Error && error.message.includes("wait for")
          if (!notReady || attempt === 39) throw error
          await new Promise((resolve) => setTimeout(resolve, 250))
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to print these ID cards."
      )
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">Select classes</h2>
        <div className="flex flex-wrap items-center gap-3">
          {classesLoading ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading classes...
            </p>
          ) : classesError || classes.length === 0 ? (
            <p role="alert" className="text-sm text-red-600">
              {classesError ? classError?.message || "Classes could not be loaded." : "No classes yet. Add classes in Exams and Records before creating student ID cards."}
            </p>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 w-full justify-between sm:w-72"
                >
                  <span className="truncate">{selectedLabel}</span>
                  <ChevronDown className="ml-2 size-4 shrink-0 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-72 w-72 overflow-y-auto"
              >
                <DropdownMenuCheckboxItem
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  onSelect={(event) => event.preventDefault()}
                  className="font-medium"
                >
                  All classes (entire school)
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {classes.map((cls) => (
                  <DropdownMenuCheckboxItem
                    key={cls.Id}
                    checked={selectedClassIds.has(cls.Id)}
                    onCheckedChange={() => toggleClass(cls.Id)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {cls.ClsName}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            onClick={() => void generate()}
            disabled={
              generating ||
              brandingLoading ||
              !branding ||
              selectedClassIds.size === 0
            }
          >
            <IdCard className="mr-1.5 size-4" />
            {generating
              ? "Loading students..."
              : `Generate ${selectedClassIds.size ? `for ${selectedClassIds.size} class${selectedClassIds.size === 1 ? "" : "es"}` : "cards"}`}
          </Button>
        </div>
        {selectedClassIds.size > 0 && !allSelected && (
          <ul className="flex flex-wrap gap-2" aria-label="Selected classes">
            {classes
              .filter((cls) => selectedClassIds.has(cls.Id))
              .map((cls) => (
                <li
                  key={cls.Id}
                  className="flex items-center gap-1 rounded-full bg-blue-50 py-1 pr-1 pl-3 text-xs font-medium text-blue-700"
                >
                  {cls.ClsName}
                  <button
                    type="button"
                    onClick={() => toggleClass(cls.Id)}
                    aria-label={`Remove ${cls.ClsName}`}
                    className="rounded-full p-0.5 hover:bg-blue-100"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
          </ul>
        )}
        {generateError && (
          <p role="alert" className="text-sm text-red-600">
            {generateError}
          </p>
        )}
      </div>

      {cards.length > 0 && (
        <div className="space-y-3 rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              {cards.length} card{cards.length === 1 ? "" : "s"} ready
            </h2>
            <Button
              onClick={() => void print()}
              disabled={printing || selectedCards.length === 0}
            >
              <Printer className="mr-2 size-4" />
              {printing ? "Preparing print..." : `Print ${selectedCards.length} card${selectedCards.length === 1 ? "" : "s"}`}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Each student prints as a front and back page. Use duplex printing,
            long-edge flip, actual size, with headers/footers disabled.
          </p>
          <CardSelectionList
            cards={cards}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
          />
          <div
            ref={preview}
            className="grid max-h-[32rem] gap-4 overflow-y-auto rounded-lg border bg-gray-50 p-4 sm:grid-cols-2"
          >
            {selectedCards.map((card) => (
              <IdCardPreview key={card.personId} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type CardGroup = "students" | "staff"

export default function BulkIdCardsPage() {
  const [group, setGroup] = useState<CardGroup>("students")

  return (
    <div className="space-y-5 py-6">
      <PageHeader
        title="ID Cards"
        description="Generate and print ID cards for students (by class or the entire school) or for staff."
      />
      <div
        role="group"
        aria-label="Card type"
        className="inline-flex rounded-lg border bg-white p-1"
      >
        {(["students", "staff"] as const).map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={group === option ? "default" : "ghost"}
            aria-pressed={group === option}
            onClick={() => setGroup(option)}
          >
            {option === "students" ? "Students" : "Staff"}
          </Button>
        ))}
      </div>
      {group === "students" ? <StudentIdCardsPanel /> : <StaffIdCardsPanel />}
    </div>
  )
}
