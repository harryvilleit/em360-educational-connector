import { useMemo, useRef, useState } from "react"
import { IdCard, Printer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/ui/filter-select"
import IdCardPreview from "@/components/id-cards/IdCardPreview"
import CardSelectionList from "@/components/id-cards/CardSelectionList"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useStaffDirectory } from "@/hooks/staff"
import { useSchoolCardBranding } from "@/hooks/useSchoolCardBranding"
import { idCardIssuedDate, type SchoolIdCard } from "@/lib/idCards"
import { printIdCards } from "@/lib/printIdCards"
import { isActiveStatusLabel } from "./types/normalize"

const ALL_ROLES = "all"
const PAGE_SIZE = 100

export default function StaffIdCardsPanel() {
  const schoolId = useSchoolId()
  const { directory, isLoading, isError, error, refetch } = useStaffDirectory({
    schoolId,
    pageNumber: 1,
    pageSize: PAGE_SIZE,
  })
  const { branding, isLoading: brandingLoading } = useSchoolCardBranding(
    schoolId,
    { enabled: true, contactEnabled: false }
  )

  const [roleId, setRoleId] = useState(ALL_ROLES)
  const [cards, setCards] = useState<SchoolIdCard[]>([])
  const [printing, setPrinting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const preview = useRef<HTMLDivElement>(null)
  const selectedCards = cards.filter((card) => selectedIds.has(card.personId))

  const roles = directory?.availableRoles ?? []
  const roleName = roles.find((role) => role.id === roleId)?.name
  const staff = useMemo(
    () =>
      (directory?.staff.items ?? []).filter(
        (member) =>
          isActiveStatusLabel(member.statusLabel) &&
          (roleId === ALL_ROLES || member.role === roleName)
      ),
    [directory, roleId, roleName]
  )

  function generate() {
    if (!branding) return
    const issuedOn = idCardIssuedDate()
    const nextCards: SchoolIdCard[] = staff.map((member) => ({
      kind: "staff",
      schoolId,
      schoolName: branding.schoolName,
      schoolLogo: branding.schoolLogo,
      schoolPhone: branding.schoolPhone,
      schoolEmail: branding.schoolEmail,
      schoolAddress: branding.schoolAddress,
      personId: member.subUserId,
      displayId: member.subUserId,
      name: member.fullName,
      photo: member.profilePicture ?? undefined,
      role: member.role,
      department: member.department,
      issuedOn,
    }))
    setCards(nextCards)
    setSelectedIds(new Set(nextCards.map((card) => card.personId)))
  }

  async function print() {
    if (!preview.current || !selectedCards.length) return
    setPrinting(true)
    try {
      // QR codes render asynchronously per card; retry until the last are ready
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
        error instanceof Error
          ? error.message
          : "Unable to print these ID cards."
      )
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">Select staff</h2>
        {isLoading ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading staff...
          </p>
        ) : isError ? (
          <div className="flex items-center gap-3">
            <p role="alert" className="text-sm text-red-600">
              {error instanceof Error && error.message
                ? error.message
                : "Staff could not be loaded."}
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              value={roleId}
              onChange={(value) => {
                setRoleId(value)
                setCards([])
              }}
              options={[
                { value: ALL_ROLES, label: "All roles" },
                ...roles.map((role) => ({ value: role.id, label: role.name })),
              ]}
              placeholder="All roles"
              triggerClassName="w-56"
            />
            <Button
              onClick={generate}
              disabled={brandingLoading || !branding || staff.length === 0}
            >
              <IdCard className="mr-1.5 size-4" />
              {`Generate for ${staff.length} staff`}
            </Button>
          </div>
        )}
        {(directory?.staff.totalItems ?? 0) > PAGE_SIZE && (
          <p className="text-sm text-amber-700">
            Only the first {PAGE_SIZE} staff are shown. Narrow by role to find
            the rest.
          </p>
        )}
        {!isLoading && !isError && staff.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No active staff found for this selection.
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
              {printing
                ? "Preparing print..."
                : `Print ${selectedCards.length} card${selectedCards.length === 1 ? "" : "s"}`}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Print at actual size with headers/footers disabled.
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
