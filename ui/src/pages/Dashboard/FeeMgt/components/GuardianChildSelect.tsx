import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useGetAllGuardians,
  useGetGuardianChildren,
  useGetGuardianDetails,
} from "@/hooks/guardian"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import type { GuardianChildI, GuardianItemI } from "@/api/guardian.api/types"

interface GuardianChildSelectProps {
  schoolId: string
  guardianId: string
  onGuardianChange: (guardianId: string, guardian?: GuardianItemI) => void
  studentId?: string
  onStudentChange?: (studentId: string, student?: GuardianChildI) => void
  guardianError?: string
  studentError?: string
  showStudent?: boolean
}

export default function GuardianChildSelect({
  schoolId,
  guardianId,
  onGuardianChange,
  studentId,
  onStudentChange,
  guardianError,
  studentError,
  showStudent = true,
}: GuardianChildSelectProps) {
  const [search, setSearch] = useState("")
  const [lastPickedGuardian, setLastPickedGuardian] =
    useState<GuardianItemI | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)

  // Only trust the locally-cached "picked from search" guardian while it
  // still matches the current guardianId prop — this lets the guardianId
  // prop be cleared/changed by a parent without a separate effect to sync it.
  const selectedGuardian =
    lastPickedGuardian?.id === guardianId ? lastPickedGuardian : null

  const { guardians, isLoading: guardiansLoading } = useGetAllGuardians({
    keyword: debouncedSearch.trim() || undefined,
    pageSize: 20,
  })

  const { children, isLoading: childrenLoading } = useGetGuardianChildren({
    guardianId,
    schoolId,
  })

  // guardianId can arrive pre-set from a parent component (e.g. Payment
  // Reminder passing a student's resolved guardian) without ever going
  // through selectGuardian() below — fetch its display details in that case.
  const { guardian: fetchedGuardian } = useGetGuardianDetails({
    guardianId: !selectedGuardian && guardianId ? guardianId : "",
  })

  const displayGuardian: { name: string; email?: string } | null =
    selectedGuardian
      ? {
          name: `${selectedGuardian.firstName} ${selectedGuardian.lastName}`,
          email: selectedGuardian.email,
        }
      : fetchedGuardian
        ? { name: fetchedGuardian.fullName, email: fetchedGuardian.email }
        : null

  function selectGuardian(g: GuardianItemI) {
    setLastPickedGuardian(g)
    setSearch("")
    onGuardianChange(g.id, g)
    onStudentChange?.("")
  }

  function clearGuardian() {
    setLastPickedGuardian(null)
    setSearch("")
    onGuardianChange("")
    onStudentChange?.("")
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Parent / Guardian <span className="text-red-500">*</span>
        </Label>

        {displayGuardian ? (
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
            <div className="min-w-0">
              <span className="font-medium">{displayGuardian.name}</span>
              {displayGuardian.email && (
                <span className="ml-2 truncate text-gray-500">
                  · {displayGuardian.email}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={clearGuardian}
              className="ml-4 shrink-0 text-xs text-gray-400 hover:text-red-500"
            >
              ✕ Change
            </button>
          </div>
        ) : (
          <div>
            <Input
              type="email"
              value={search}
              placeholder="Search parent by email address"
              onChange={(e) => setSearch(e.target.value)}
              className={`rounded-md ${guardianError ? "border-red-400" : "border-gray-200"}`}
            />
            {search && (
              <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                {guardiansLoading ? (
                  <div className="px-4 py-3 text-xs text-gray-500">
                    Searching...
                  </div>
                ) : guardians.length > 0 ? (
                  guardians.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectGuardian(g)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="font-medium">
                        {g.firstName} {g.lastName}
                      </span>
                      {g.email && (
                        <span className="ml-2 text-xs text-gray-400">
                          {g.email}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-500">
                    No guardian found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {guardianError && (
          <p className="text-xs text-red-500">{guardianError}</p>
        )}
      </div>

      {showStudent && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Student <span className="text-red-500">*</span>
          </Label>
          <Select
            value={studentId}
            onValueChange={(id) => {
              const child = children.find((c) => c.studentId === id)
              onStudentChange?.(id, child)
            }}
            disabled={!guardianId || childrenLoading}
          >
            <SelectTrigger
              className={`w-full rounded-md ${studentError ? "border-red-400" : "border-gray-200"}`}
            >
              <SelectValue
                placeholder={
                  !guardianId
                    ? "Select a guardian first"
                    : childrenLoading
                      ? "Loading children..."
                      : "Select student"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {children.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No children linked to this guardian
                </div>
              ) : (
                children.map((c) => (
                  <SelectItem key={c.studentId} value={c.studentId}>
                    {c.fullName} — {c.currentClass}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {studentError && (
            <p className="text-xs text-red-500">{studentError}</p>
          )}
        </div>
      )}
    </div>
  )
}
