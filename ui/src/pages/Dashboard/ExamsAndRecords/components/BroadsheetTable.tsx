import { Fragment, useMemo, type KeyboardEvent } from "react"
import { LockKeyhole } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { BroadsheetResponseDto } from "@/api/examAndRecords.api/types"

type ScoreField = number | ""
export type BroadsheetGrid = Record<string, Record<string, Record<string, ScoreField>>>
export interface BroadsheetComputedRow { studentId: string; total: number; average: number; grade: string; position: number }
interface Props { data: BroadsheetResponseDto; grid: BroadsheetGrid; computed: BroadsheetComputedRow[] | null; onScoreChange: (studentId: string, subjectId: string, field: string, raw: string, max: number, min: number) => void }

const BANDS = [
  { head: "bg-sky-50", border: "border-l border-sky-200", label: "text-sky-900" },
  { head: "bg-violet-50", border: "border-l border-violet-200", label: "text-violet-900" },
  { head: "bg-teal-50", border: "border-l border-teal-200", label: "text-teal-900" },
  { head: "bg-rose-50", border: "border-l border-rose-200", label: "text-rose-900" },
  { head: "bg-indigo-50", border: "border-l border-indigo-200", label: "text-indigo-900" },
] as const
const STATUS_STYLE = { APPROVED: "bg-emerald-100 text-emerald-800", PENDING: "bg-amber-100 text-amber-800", DRAFT: "bg-sky-100 text-sky-800", REJECTED: "bg-rose-100 text-rose-800", NOT_STARTED: "bg-slate-100 text-slate-700" } as const

export function BroadsheetTable({ data, grid, computed, onScoreChange }: Props) {
  const results = useMemo(() => new Map(computed?.map((row) => [row.studentId, row]) ?? []), [computed])
  const handleEnter = (event: KeyboardEvent<HTMLInputElement>, index: number, subjectId: string, field: string) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    const next = data.students.slice(index + 1).find((student) => student.subjectScores.find((score) => score.subjectId === subjectId)?.isOffering)
    if (next) document.querySelector<HTMLInputElement>(`[data-score-cell="${next.studentId}-${subjectId}-${field}"]`)?.focus()
  }
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-max border-collapse text-sm">
    <thead><tr>
      <th rowSpan={2} className="sticky left-0 z-20 border-b bg-slate-100 px-3 py-2 text-left text-xs">#</th>
      <th rowSpan={2} className="sticky left-10 z-20 min-w-[150px] border-b bg-slate-100 px-3 py-2 text-left text-xs">Student</th>
      <th rowSpan={2} className="min-w-[95px] border-b bg-slate-100 px-3 py-2 text-left text-xs">Adm No</th>
      {data.subjects.map((subject, i) => { const band = BANDS[i % BANDS.length]; const locked = subject.isApproved || subject.worksheetStatus === "APPROVED"; return <th key={subject.subjectId} colSpan={data.assessmentComponents.length + 1} className={cn("border-b px-2 py-2 text-center font-bold", band.head, band.border, band.label)}>
        <span className="flex items-center justify-center gap-1">{subject.subjectName}{locked && <LockKeyhole className="size-3.5" aria-label="Locked" />}</span>
        <span className="block text-[10px] font-medium opacity-70">{data.assessmentComponents.map((component) => `${component.name}/${component.weightPercentage}`).join(" · ")}</span>
        <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px]", subject.isComplete ? STATUS_STYLE[subject.worksheetStatus] : "bg-rose-100 text-rose-800")}>{subject.isComplete ? subject.worksheetStatus : "Incomplete"}</span>
      </th> })}
      <th colSpan={4} className="border-b border-l border-amber-200 bg-amber-50 px-2 py-2 text-center font-bold text-amber-950">Class result (click Calculate)</th>
    </tr><tr>
      {data.subjects.map((subject, i) => { const band = BANDS[i % BANDS.length]; return <Fragment key={`${subject.subjectId}-head`}>{data.assessmentComponents.map((component, componentIndex) => <th key={component.id} className={cn("border-b px-1 py-2 text-[10px]", band.head, componentIndex === 0 && band.border)}>{component.name}</th>)}<th className={cn("border-b px-1 py-2 text-[10px] text-emerald-800", band.head)}>Total</th></Fragment> })}
      {["Overall", "Avg", "Grade", "Pos"].map((label, i) => <th key={label} className={cn("border-b bg-amber-100 px-2 py-2 text-[11px] font-bold text-amber-950", i === 0 && "border-l border-amber-200")}>{label}</th>)}
    </tr></thead>
    <tbody>{data.students.map((student, studentIndex) => { const result = results.get(student.studentId); return <tr key={student.studentId} className="border-b border-slate-100 hover:bg-slate-50/50">
      <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs text-slate-500">{studentIndex + 1}</td><td className="sticky left-10 z-10 bg-white px-3 py-2 font-medium">{student.studentName}<span className="ml-1 text-[10px] text-slate-400">{student.gender}</span></td><td className="px-3 py-2 text-xs text-slate-500">{student.admissionNumber}</td>
      {data.subjects.map((subject, subjectIndex) => { const band = BANDS[subjectIndex % BANDS.length]; const enrollment = student.subjectScores.find((x) => x.subjectId === subject.subjectId); if (!enrollment?.isOffering) return <td key={subject.subjectId} colSpan={data.assessmentComponents.length + 1} className={cn("border-l text-center text-slate-400", band.head)}>--</td>; const score = grid[student.studentId]?.[subject.subjectId]; const disabled = !subject.canEdit; const values = data.assessmentComponents.map((component) => score?.[component.id] ?? ""); return <Fragment key={subject.subjectId}>{data.assessmentComponents.map((component, componentIndex) => { const saved = enrollment.scores.find((item) => item.assessmentComponentId === component.id); const automated = saved?.automatedScore ?? 0; const total = Number(score?.[component.id] ?? saved?.score ?? 0); const manual = Math.max(0, total - automated); return <td key={component.id} className={cn("px-1 py-1.5 align-top", componentIndex === 0 && band.border, band.head)}><Input type="number" min={automated} max={component.weightPercentage} disabled={disabled} data-score-cell={`${student.studentId}-${subject.subjectId}-${component.id}`} aria-label={`${student.studentName} ${subject.subjectName} ${component.name}`} value={score?.[component.id] ?? ""} onKeyDown={(event) => handleEnter(event, studentIndex, subject.subjectId, component.id)} onChange={(event) => onScoreChange(student.studentId, subject.subjectId, component.id, event.target.value, component.weightPercentage, automated)} className="h-9 w-[4.75rem] bg-white px-1 text-center text-xs disabled:opacity-60" /><div className="mt-1 flex justify-center gap-1 whitespace-nowrap text-[9px]"><span className="rounded bg-blue-100 px-1 text-blue-700">A {automated}</span><span className="rounded bg-white px-1 text-slate-600">M {manual}</span></div></td>})}<td className={cn("px-1 py-1.5", band.head)}><div className={cn("flex h-9 w-[4.25rem] items-center justify-center rounded-md text-xs font-bold", values.every((value) => value !== "") ? "bg-emerald-200 text-emerald-950" : "bg-emerald-50 text-emerald-400")}>{values.every((value) => value !== "") ? values.reduce<number>((sum, value) => sum + Number(value), 0) : "--"}</div></td></Fragment> })}
      <td className="border-l border-amber-200 bg-amber-50/60 px-3 py-2 text-center font-bold">{result?.total ?? "--"}</td><td className="bg-amber-50/60 px-3 py-2 text-center">{result ? `${result.average.toFixed(1)}%` : "--"}</td><td className="bg-amber-50/60 px-3 py-2 text-center">{result?.grade ?? "--"}</td><td className="bg-amber-50/60 px-3 py-2 text-center font-semibold">{result?.position ?? "--"}</td>
    </tr> })}</tbody>
  </table></div></div>
}
