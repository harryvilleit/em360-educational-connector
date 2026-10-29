import { FilterSelect } from "@/components/ui/filter-select"
import { casHeader, type CasRow } from "../../casSheet"
import type { CasSheetState } from "../../useCasSheet"
import { ReportSection } from "../shared/ReportParts"

const CAS_PAGE_SIZE = 30

export function CasSheetTab({
  cas,
  classId,
  onClassChange,
  periodReady,
}: {
  cas: CasSheetState
  classId: string
  onClassChange: (classId: string) => void
  periodReady: boolean
}) {
  const sheet = cas.sheet
  const empty = !periodReady
    ? "Select a session and term to load the sheet."
    : !classId
      ? "Select a class to load the sheet."
      : cas.failed
        ? "The sheet could not be loaded. You may not have access to it."
        : "No students are enrolled in this class for the selected period."

  return (
    <div className="space-y-3">
      <ReportSection
        title="Primary School CAS Registration Form"
        subtitle={
          sheet
            ? `${sheet.school} · ${sheet.className}`
            : "Continuous assessment scores by student and subject"
        }
        columns={[
          {
            key: "sn",
            header: "S/N",
            render: (_r: CasRow, i: number) => i + 1,
          },
          { key: "n", header: "Student name", render: (r) => r.name },
          { key: "a", header: "Admission no.", render: (r) => r.admissionNumber },
          { key: "g", header: "Gender", render: (r) => r.gender },
          ...(sheet?.columns ?? []).map((c) => ({
            key: c.key,
            header: casHeader(c),
            render: (r: CasRow) => r.scores[c.key] ?? "—",
          })),
        ]}
        rows={sheet?.rows ?? []}
        rowKey={(r) => r.id}
        loading={cas.loading}
        empty={empty}
        pageSize={CAS_PAGE_SIZE}
        searchBy={(r) => `${r.name} ${r.admissionNumber}`}
        searchPlaceholder="Search student"
        countLabel="students"
        extraActions={
          <FilterSelect
            value={classId}
            onChange={onClassChange}
            options={cas.classes}
            placeholder="Class"
            disabled={cas.classes.length === 0}
          />
        }
      />
      <p className="text-xs text-gray-500">
        Date of birth, state of origin and the surname / first name split on the
        paper form are not held in the results source, so they are left out
        rather than guessed. A dash means the student does not offer that
        subject.
      </p>
    </div>
  )
}
