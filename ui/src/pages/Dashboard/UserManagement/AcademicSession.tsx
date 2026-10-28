import { useState, useMemo, useCallback } from "react"
import { useNavigate, useParams } from "react-router"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllSchoolSessions,
  useCreateSchoolSession,
  useUpdateSchoolSession,
  useDeleteSchoolSession,
  useSetCurrentSchoolSession,
  useSetCurrentSchoolTerm,
  useGetAllSchoolTerms,
} from "@/hooks/userMgt"
import type { SchoolSessionItem } from "@/api/userMgt.api/types"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import SessionModal from "./Component/SessionModal"
import TermsTab from "./Component/TermsTab"
import CreateTermModal from "./Component/CreateTermModal"
import AddTermModal from "./Component/AddTermModal"
import SessionsTab from "./Component/SessionsTab"

export default function AcademicSessionPage() {
  const schoolId = useSchoolId()
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const { sessions, isLoading, refetch } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })

  const { createSchoolSessionAsync, isLoading: isCreating } =
    useCreateSchoolSession()
  const { updateSchoolSessionAsync, isLoading: isUpdating } =
    useUpdateSchoolSession()
  const { deleteSchoolSessionAsync } = useDeleteSchoolSession()
  const { setCurrentSchoolSessionAsync } = useSetCurrentSchoolSession()
  const { setCurrentSchoolTermAsync } = useSetCurrentSchoolTerm()

  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)

  const { terms: availableTerms } = useGetAllSchoolTerms({
    schoolId,
    pageSize: 200,
  })

  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [termModalOpen, setTermModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<SchoolSessionItem | null>(null)
  const [addTermSession, setAddTermSession] = useState<SchoolSessionItem | null>(null)

  const currentSession = useMemo(
    () =>
      sessions.find(
        (s) =>
          s.Id === currentSessionId || s.IsCurrent === true || s.Status === "Active"
      ),
    [sessions, currentSessionId]
  )
  const currentTerm = useMemo(
    () =>
      sessions
        .flatMap((s) => s.Terms)
        .find((t) => t.Id === currentTermId || t.IsCurrent),
    [sessions, currentTermId]
  )
  const totalTerms = availableTerms.length

  async function handleSetCurrentSession(id: string) {
    try {
      await setCurrentSchoolSessionAsync({ schoolSessionId: id })
    } catch {}
  }

  const handleSetCurrentTerm = useCallback(
    async (termId: string) => {
      try {
        await setCurrentSchoolTermAsync({ schoolSessionTermId: termId })
      } catch {}
    },
    [setCurrentSchoolTermAsync]
  )

  async function handleDeleteSession(session: SchoolSessionItem) {
    if (session.IsCurrent || session.Status === "Active") {
      toast.error("Cannot delete the active session")
      return
    }
    try {
      await deleteSchoolSessionAsync(session.Id)
      refetch()
    } catch {}
  }

  function handleEditSession(session: SchoolSessionItem) {
    setEditingSession(session)
    setSessionModalOpen(true)
  }

  async function handleSaveSession(data: {
    sessionId?: string
    sessionName: string
    setAsCurrent: boolean
    selectedTerms: { id: string; startDate: string; endDate: string }[]
    activeTermId: string | null
  }) {
    try {
      if (data.sessionId) {
        const session = editingSession!
        await updateSchoolSessionAsync({
          id: data.sessionId,
          sessionName: data.sessionName,
          schoolId,
          terms: data.selectedTerms.map((t) => ({
            id: session.Terms.find((st) => st.SchoolTermId === t.id)!.Id,
            schoolTermId: t.id,
            startDate: t.startDate,
            endDate: t.endDate,
          })),
        })

        if (data.activeTermId) {
          const sessionTerm = session.Terms.find(
            (t) => t.SchoolTermId === data.activeTermId
          )
          if (sessionTerm) {
            await setCurrentSchoolTermAsync({ schoolSessionTermId: sessionTerm.Id })
          }
        }

        refetch()
        setSessionModalOpen(false)
        setEditingSession(null)
        return
      }

      await createSchoolSessionAsync({
        sessionName: data.sessionName,
        schoolId,
        terms: data.selectedTerms.map((t) => ({
          schoolTermId: t.id,
          startDate: t.startDate,
          endDate: t.endDate,
        })),
      })

      // The session now exists. Close the modal before the follow-up calls so a
      // failure there can't leave it open and turn a retry into a 409 duplicate.
      setSessionModalOpen(false)

      if (data.setAsCurrent || data.activeTermId) {
        const refreshed = await refetch()
        const newSession = refreshed.data?.Value?.Items?.find(
          (s) => s.SessionName === data.sessionName
        )
        if (newSession) {
          if (data.setAsCurrent) {
            await setCurrentSchoolSessionAsync({ schoolSessionId: newSession.Id })
          }
          if (data.activeTermId) {
            const sessionTerm = newSession.Terms.find(
              (t) => t.SchoolTermId === data.activeTermId
            )
            if (sessionTerm) {
              await setCurrentSchoolTermAsync({ schoolSessionTermId: sessionTerm.Id })
            }
          }
        }
        refetch()
      }

      setSessionModalOpen(false)
    } catch {}
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Sessions & Terms"
        description="Manage academic years and the terms within each session."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setTermModalOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" />
              New Term
            </Button>
            <Button
              variant="primary"
              onClick={() => setSessionModalOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" />
              New Session
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
        </TabsList>

        <SessionsTab
          sessions={sessions}
          isLoading={isLoading}
          currentSession={currentSession}
          currentTerm={currentTerm}
          totalTerms={totalTerms}
          onSetCurrentSession={handleSetCurrentSession}
          onCreateSession={() => setSessionModalOpen(true)}
          onEditSession={handleEditSession}
          onAddTerm={setAddTermSession}
        />

        <TermsTab
          sessions={sessions}
          availableTerms={availableTerms}
          isLoading={isLoading}
          schoolId={schoolId}
          onSetCurrentTerm={handleSetCurrentTerm}
          onCreateTerm={() => setTermModalOpen(true)}
        />
      </Tabs>

      {sessionModalOpen && (
        <SessionModal
          isSaving={editingSession ? isUpdating : isCreating}
          onClose={() => {
            setSessionModalOpen(false)
            setEditingSession(null)
          }}
          onSave={handleSaveSession}
          availableTerms={availableTerms}
          session={editingSession ?? undefined}
        />
      )}

      {termModalOpen && (
        <CreateTermModal
          open={termModalOpen}
          onClose={() => setTermModalOpen(false)}
          schoolId={schoolId}
        />
      )}

      {addTermSession && (
        <AddTermModal
          open
          onClose={() => setAddTermSession(null)}
          session={addTermSession}
          availableTerms={availableTerms}
          schoolId={schoolId}
        />
      )}
    </div>
  )
}
