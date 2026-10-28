import { memo, useCallback, useMemo, useState } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Star,
} from "lucide-react"
import type { SchoolSessionItem, SchoolSessionTermItem, SchoolTermItem } from "@/api/userMgt.api/types"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import EditTermModal from "./EditTermModal"

interface TermRowProps {
  term: SchoolSessionTermItem
  isCurrentTerm: boolean
  onSetCurrent: (termId: string) => void
  onEdit: (term: SchoolSessionTermItem) => void
}

const TermRow = memo(function TermRow({
  term,
  isCurrentTerm,
  onSetCurrent,
  onEdit,
}: TermRowProps) {
  return (
    <tr className={`transition-colors hover:bg-gray-50/50 ${isCurrentTerm ? "bg-green-50/20" : ""}`}>
      {/* Term name */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
            isCurrentTerm ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
          }`}>
            <BookOpen className="size-4" />
          </div>
          <p className="font-semibold text-gray-900">{term.TermName}</p>
        </div>
      </td>
      {/* Actions */}
      <td className="px-4 py-3.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-lg">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            {!isCurrentTerm && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() => onSetCurrent(term.Id)}
                >
                  <Star className="size-3.5 text-gray-500" />
                  Set as Active
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onEdit(term)}
            >
              <Pencil className="size-3.5 text-gray-500" />
              Edit Term
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
})

const UnassignedTermRow = memo(function UnassignedTermRow({
  term,
  onEdit,
}: {
  term: SchoolTermItem
  onEdit: (term: SchoolTermItem) => void
}) {
  return (
    <tr className="transition-colors hover:bg-gray-50/50">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
            <BookOpen className="size-4" />
          </div>
          <p className="font-semibold text-gray-900">{term.TermName}</p>
        </div>
      </td>
      <td className="px-4 py-3.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-lg">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() => onEdit(term)}
            >
              <Pencil className="size-3.5 text-gray-500" />
              Edit Term
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
})

interface TermsTabProps {
  sessions: SchoolSessionItem[]
  availableTerms: SchoolTermItem[]
  isLoading: boolean
  schoolId: string
  onSetCurrentTerm: (termId: string) => void
  onCreateTerm: () => void
}

export default function TermsTab({ sessions, availableTerms, isLoading, schoolId, onSetCurrentTerm, onCreateTerm }: TermsTabProps) {
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)
  const [editingTerm, setEditingTerm] = useState<{ id: string; name: string } | null>(null)

  const allTerms = useMemo(
    () =>
      sessions.flatMap((s) =>
        s.Terms.map((t) => ({ term: t, sessionName: s.SessionName }))
      ),
    [sessions]
  )

  const unassignedTerms = useMemo(
    () =>
      availableTerms.filter(
        (t) => !sessions.some((s) => s.Terms.some((st) => st.SchoolTermId === t.Id))
      ),
    [availableTerms, sessions]
  )

  const handleEditAssignedTerm = useCallback(
    (term: SchoolSessionTermItem) =>
      setEditingTerm({ id: term.SchoolTermId, name: term.TermName }),
    []
  )
  const handleEditUnassignedTerm = useCallback(
    (term: SchoolTermItem) =>
      setEditingTerm({ id: term.Id, name: term.TermName }),
    []
  )

  return (
    <TabsContent value="terms" className="space-y-6">
      {isLoading || (allTerms.length === 0 && unassignedTerms.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
            <CalendarDays className="size-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No terms yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click <span className="font-medium">"New Term"</span> to add the first term.
          </p>
          <Button
            onClick={onCreateTerm}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            New Term
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white ">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  {["Term", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allTerms.map(({ term }) => (
                  <TermRow
                    key={term.Id}
                    term={term}
                    isCurrentTerm={term.Id === currentTermId || term.IsCurrent}
                    onSetCurrent={onSetCurrentTerm}
                    onEdit={handleEditAssignedTerm}
                  />
                ))}
                {unassignedTerms.map((term) => (
                  <UnassignedTermRow
                    key={term.Id}
                    term={term}
                    onEdit={handleEditUnassignedTerm}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {allTerms.length} term{allTerms.length !== 1 ? "s" : ""} across {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              {unassignedTerms.length > 0 &&
                ` · ${unassignedTerms.length} not yet assigned to a session`}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Note: Only one term can be active at a time — setting a term as active
              replaces the previously active term.
            </p>
          </div>
        </div>
      )}

      {editingTerm && (
        <EditTermModal
          open={!!editingTerm}
          onClose={() => setEditingTerm(null)}
          schoolId={schoolId}
          term={editingTerm}
        />
      )}
    </TabsContent>
  )
}
