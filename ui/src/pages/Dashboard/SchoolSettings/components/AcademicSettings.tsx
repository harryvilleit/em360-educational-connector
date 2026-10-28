import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import SettingsCard from "./SettingsCard"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllSchoolSessions,
  useUpdateSchoolSession,
  useSetCurrentSchoolSession,
  useSetCurrentSchoolTerm,
} from "@/hooks/userMgt"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"

export default function AcademicSettings() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  // ── Fetch sessions from the API ─────────────────────────────────────────────
  const { sessions, isLoading } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })

  const { updateSchoolSessionAsync, isLoading: isUpdating } = useUpdateSchoolSession()
  const { setCurrentSchoolSessionAsync, isLoading: isSettingSession } = useSetCurrentSchoolSession()
  const { setCurrentSchoolTermAsync, isLoading: isSettingTerm } = useSetCurrentSchoolTerm()

  const { currentSessionId, currentTermId } = useCurrentAcademicStore()

  const isSaving = isUpdating || isSettingSession || isSettingTerm

  // ── Derive current session / term (store is authoritative, API fields as fallback) ──
  const currentSession = sessions.find(
    (s) => s.Id === currentSessionId || s.IsCurrent === true || s.Status === "Active"
  )
  const currentTerm = sessions
    .flatMap((s) => s.Terms)
    .find((t) => t.Id === currentTermId || t.IsCurrent)

  // ── Local form state ────────────────────────────────────────────────────────
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [selectedTermId, setSelectedTermId] = useState("")
  const [termStartDate, setTermStartDate] = useState("")
  const [termEndDate, setTermEndDate] = useState("")
  const [error, setError] = useState("")


  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(
        currentSessionId ?? currentSession?.Id ?? sessions[0].Id
      )
    }
  }, [sessions])

  useEffect(() => {
    if (!selectedTermId) {
      const id = currentTermId ?? currentTerm?.Id
      if (id) setSelectedTermId(id)
    }
  }, [currentTermId, currentTerm])

  const selectedSession = sessions.find((s) => s.Id === selectedSessionId)
  const selectedTerm = selectedSession?.Terms.find((t) => t.Id === selectedTermId)

  // Populate date fields when term selection changes
  useEffect(() => {
    if (selectedTerm) {
      setTermStartDate(
        selectedTerm.StartDate
          ? selectedTerm.StartDate.split("T")[0]
          : ""
      )
      setTermEndDate(
        selectedTerm.EndDate
          ? selectedTerm.EndDate.split("T")[0]
          : ""
      )
    } else {
      setTermStartDate("")
      setTermEndDate("")
    }
  }, [selectedTermId, selectedSessionId])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSessionChange(id: string) {
    setSelectedSessionId(id)
    setSelectedTermId("")
    setError("")
  }

  function handleTermChange(id: string) {
    setSelectedTermId(id)
    setError("")
  }

  async function handleSave() {
    if (!selectedSessionId) { setError("Please select a session"); return }
    if (!selectedTermId)    { setError("Please select a term");    return }
    if (!termStartDate)     { setError("Start date is required");  return }
    if (!termEndDate)       { setError("End date is required");    return }
    if (termEndDate <= termStartDate) {
      setError("End date must be after start date")
      return
    }

    setError("")

    try {
      // 1 — Update the selected term's dates (requires sending all terms)
      const updatedTerms = selectedSession!.Terms.map((t) => ({
        id: t.Id,
        schoolTermId: t.SchoolTermId,
        startDate: t.Id === selectedTermId ? termStartDate : t.StartDate.split("T")[0],
        endDate:   t.Id === selectedTermId ? termEndDate   : t.EndDate.split("T")[0],
      }))

      await updateSchoolSessionAsync({
        id: selectedSessionId,
        sessionName: selectedSession!.SessionName,
        schoolId,
        terms: updatedTerms,
      })

      // 2 — Set selected session as current (if not already)
      if (selectedSession?.Id !== currentSession?.Id) {
        await setCurrentSchoolSessionAsync({ schoolSessionId: selectedSessionId })
      }

      // 3 — Set selected term as active (if not already)
      if (selectedTerm?.Id !== currentTerm?.Id) {
        await setCurrentSchoolTermAsync({ schoolSessionTermId: selectedTermId })
      }

      toast.success("Academic settings saved")
    } catch {
      // Errors already toasted inside each hook
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SettingsCard
        title="Current Academic Period"
        description="Set the active session and term for the school."
      >
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </SettingsCard>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────────

  if (!isLoading && sessions.length === 0) {
    return (
      <SettingsCard
        title="Current Academic Period"
        description="Set the active session and term for the school."
      >
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              No academic sessions found
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Create sessions and terms in User Management before configuring
              this setting.
            </p>
            <button
              onClick={() =>
                navigate(DashboardRoutes.toUsersAcademic(productId ?? ""))
              }
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
            >
              <ExternalLink className="size-3" />
              Go to Academic Sessions
            </button>
          </div>
        </div>
      </SettingsCard>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────────

  const sortedSessions = sessions.slice().sort((a, b) =>
    b.SessionName.localeCompare(a.SessionName)
  )

  const sortedTerms = (selectedSession?.Terms ?? [])
    .slice()
    .sort((a, b) => a.StartDate.localeCompare(b.StartDate))

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Current Academic Period"
        description="Set the active session and term. You can also update the term start and end dates here."
      >
        <FieldGroup>
          {/* Row 1 — Session + Term dropdowns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Session */}
            <Field>
              <FieldLabel>Academic Session</FieldLabel>
              <Select value={selectedSessionId} onValueChange={handleSessionChange}>
                <SelectTrigger className="border-gray-200 py-5">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sortedSessions.map((s) => (
                    <SelectItem key={s.Id} value={s.Id}>
                      <span className="flex items-center gap-2">
                        {s.SessionName}
                        {(s.Id === currentSessionId || s.IsCurrent || s.Status === "Active") && (
                          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            Current
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Term */}
            <Field>
              <FieldLabel>Current Term</FieldLabel>
              <Select
                value={selectedTermId}
                onValueChange={handleTermChange}
                disabled={!selectedSessionId || sortedTerms.length === 0}
              >
                <SelectTrigger className="border-gray-200 py-5">
                  <SelectValue
                    placeholder={
                      sortedTerms.length === 0
                        ? "No terms in this session"
                        : "Select term"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sortedTerms.map((t) => (
                    <SelectItem key={t.Id} value={t.Id}>
                      <span className="flex items-center gap-2">
                        {t.TermName}
                        {(t.Id === currentTermId || t.IsCurrent) && (
                          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                            Active
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSessionId && sortedTerms.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No terms found.{" "}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        DashboardRoutes.toUsersAcademicDetail(
                          productId ?? "",
                          selectedSessionId
                        )
                      )
                    }
                    className="font-medium underline underline-offset-2"
                  >
                    Add terms
                  </button>
                </p>
              )}
            </Field>
          </div>

          {selectedTermId && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Term Start Date</FieldLabel>
                <Input
                  type="date"
                  value={termStartDate}
                  onChange={(e) => {
                    setTermStartDate(e.target.value)
                    setError("")
                  }}
                  className="border-gray-200 py-5"
                />
              </Field>
              <Field>
                <FieldLabel>Term End Date</FieldLabel>
                <Input
                  type="date"
                  value={termEndDate}
                  min={termStartDate || undefined}
                  onChange={(e) => {
                    setTermEndDate(e.target.value)
                    setError("")
                  }}
                  className="border-gray-200 py-5"
                />
              </Field>
            </div>
          )}
        </FieldGroup>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={() =>
              navigate(DashboardRoutes.toUsersAcademic(productId ?? ""))
            }
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
          >
            <ExternalLink className="size-3" />
            Manage all sessions & terms
          </button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-8 py-5 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}
