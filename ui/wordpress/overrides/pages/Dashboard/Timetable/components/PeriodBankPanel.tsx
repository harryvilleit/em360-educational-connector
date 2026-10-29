// WordPress version: identifies the built-in class period type by its code.
import { useMemo, useState } from "react"
import { MapPin, Pencil, Plus, Video, X } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSubjects } from "@/hooks/examAndRecords"
import { useGetPeriodTypesBySchool } from "@/hooks/timetablePeriodType"
import { EMPTY_TEMPLATES, usePeriodBankStore, type PeriodTemplate } from "@/store/periodBank.store"
import { TIMETABLE_TYPE, apiNumberToClassMode, getPeriodColorClasses } from "@/pages/Dashboard/Timetable/timetable.utils"
import { PeriodFormDialog } from "@/pages/Dashboard/Timetable/components/PeriodFormDialog"

export const PERIOD_TEMPLATE_DRAG_TYPE = "application/x-em360-period-template"

const TIMETABLE_TYPE_LABEL: Record<number, string> = {
  [TIMETABLE_TYPE.Assessment]: "Assessment",
}

interface PeriodBankPanelProps {
  bankKey: string
  schoolClassId: string
}

export function PeriodBankPanel({ bankKey, schoolClassId }: PeriodBankPanelProps) {
  const schoolId = useSchoolId()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PeriodTemplate | null>(null)

  const { subjects } = useGetAllSubjects(schoolId)
  const { periodTypes } = useGetPeriodTypesBySchool({ schoolId })
  const classPeriodTypeId = periodTypes.find((t) => t.isBuiltIn && t.code === "class")?.id ?? ""
  const templates = usePeriodBankStore((s) => s.templatesByClass[bankKey] ?? EMPTY_TEMPLATES)
  const addTemplates = usePeriodBankStore((s) => s.addTemplates)
  const updateTemplate = usePeriodBankStore((s) => s.updateTemplate)
  const removeTemplate = usePeriodBankStore((s) => s.removeTemplate)

  const subjectNameById = useMemo(
    () => new Map(subjects.map((s) => [s.Id, s.Name])),
    [subjects]
  )
  const periodTypeById = useMemo(
    () => new Map(periodTypes.map((t) => [t.id, t])),
    [periodTypes]
  )

  function openCreateDialog() {
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  function openEditDialog(template: PeriodTemplate) {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) setEditingTemplate(null)
  }

  function labelFor(template: PeriodTemplate): string {
    if (template.periodTypeId === classPeriodTypeId) {
      return (
        (template.subjectId && subjectNameById.get(template.subjectId)) ?? "Class"
      )
    }
    return periodTypeById.get(template.periodTypeId)?.name ?? "Period"
  }

  return (
    <div>
      <p className="mb-2 text-xs font-bold tracking-widest text-gray-700 uppercase">Periods</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openCreateDialog}
          className="flex w-40 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 py-4 text-xs font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600"
        >
          <Plus className="size-4" />
          Create Slot
        </button>

        {templates.map((template) => {
          const mode = apiNumberToClassMode(template.classMode)
          const isClassPeriod = template.periodTypeId === classPeriodTypeId
          const typeLabel = TIMETABLE_TYPE_LABEL[template.timetableType]
          const periodTypeCode =
            periodTypeById.get(template.periodTypeId)?.code ?? ""
          return (
            <div
              key={template.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(PERIOD_TEMPLATE_DRAG_TYPE, template.id)
                e.dataTransfer.effectAllowed = "copy"
              }}
              className={`group relative flex w-40 shrink-0 cursor-grab flex-col gap-1 rounded-xl px-3 py-2.5 text-white shadow-sm active:cursor-grabbing ${getPeriodColorClasses(
                periodTypeCode
              )}`}
            >
              <div className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openEditDialog(template)}
                  className="rounded p-0.5 text-white/70 hover:bg-white/20 hover:text-white"
                  title="Edit period"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeTemplate(bankKey, template.id)}
                  className="rounded p-0.5 text-white/70 hover:bg-white/20 hover:text-white"
                  title="Remove from bank"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {typeLabel && (
                <span className="w-fit rounded bg-white/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide">
                  {typeLabel}
                </span>
              )}
              <p className="truncate pr-8 text-xs font-semibold">{labelFor(template)}</p>
              <p className="text-[10px] text-white/80">
                {template.startTime} – {template.endTime}
              </p>
              {isClassPeriod && template.timetableType === TIMETABLE_TYPE.Class && mode && (
                <span className="flex items-center gap-1 text-[10px] text-white/70">
                  {mode === "virtual" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  {mode}
                </span>
              )}
              {template.timetableType === TIMETABLE_TYPE.Assessment && template.venue && (
                <span className="truncate text-[10px] text-white/70">{template.venue}</span>
              )}
              {template.timetableType === TIMETABLE_TYPE.Assessment && template.assessmentType && (
                <span className="truncate text-[10px] text-white/70">{template.assessmentType}</span>
              )}
            </div>
          )
        })}
      </div>

      <PeriodFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        schoolClassId={schoolClassId}
        initialTemplate={editingTemplate}
        onCreateTemplates={(values) => addTemplates(bankKey, values)}
        onUpdateTemplate={(id, values) => updateTemplate(bankKey, id, values)}
      />
    </div>
  )
}
