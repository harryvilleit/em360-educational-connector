import { useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSchoolSessionOptions } from "@/hooks/useSchoolSessionOptions"
import { useSchoolClassOptions } from "@/hooks/useSchoolClassOptions"
import { useElectionCategories, useCreateElection } from "@/hooks/voting"
import {
  ElectionStatus,
  ElectionVoterType,
  CandidateType as ApiCandidateType,
} from "@/api/voting.api/types"
import { DashboardRoutes } from "@/routes"
import {
  newCandidate,
  newSubcategory,
  validateElectionDraft,
  type CandidateDraft,
  type CandidateType,
} from "@/lib/electionDraft"
import type { VoterType } from "@/types/student"
import ElectionCandidateEditor from "./components/ElectionCandidateEditor"
import StaffCandidateEditor from "./components/StaffCandidateEditor"

export default function CreateElectionPage() {
  const navigate = useNavigate()
  const { productId = "" } = useParams()
  const schoolId = useSchoolId()
  const { categories: categoryList } = useElectionCategories(schoolId, "Active")
  const categories = categoryList.map((item) => item.name)
  const { mutate: createElection, isPending: submitting } = useCreateElection()
  const { classes, isLoading, isError, isFetching, refetch } =
    useSchoolClassOptions(schoolId)
  const {
    sessions,
    isLoading: sessionsLoading,
    isError: sessionsError,
    isFetching: sessionsFetching,
    refetch: refetchSessions,
  } = useSchoolSessionOptions(schoolId)
  const [academicSessionId, setAcademicSessionId] = useState("")
  const selectedSession = sessions.find(
    (session) => session.Id === academicSessionId
  )
  const sessionsUnavailable =
    !schoolId || sessionsLoading || sessionsError || sessions.length === 0
  const classNames = [...new Set(classes.map((item) => item.ClsName))]
  const classesUnavailable =
    !schoolId || isLoading || isError || classNames.length === 0
  const [category, setCategory] = useState("")
  const [voterTypes, setVoterTypes] = useState<VoterType[]>(["student"])
  const [eligibleClasses, setEligibleClasses] = useState<string[]>([])
  const studentsVote = voterTypes.includes("student")
  const [title, setTitle] = useState("")
  const [subcategories, setSubcategories] = useState(() => [newSubcategory()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const ready =
    categories.includes(category) &&
    voterTypes.length > 0 &&
    (!studentsVote || eligibleClasses.length > 0)
  const profilesLoading = subcategories.some((group) =>
    group.candidates.some((candidate) => candidate.profileLoading)
  )
  const goBack = () => navigate(DashboardRoutes.toVotingManagement(productId))

  function updateCandidate(
    groupKey: string,
    candidateKey: string,
    patch: Partial<CandidateDraft>
  ) {
    setSubcategories((groups) =>
      groups.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              candidates: group.candidates.map((candidate) =>
                candidate.key === candidateKey
                  ? { ...candidate, ...patch }
                  : candidate
              ),
            }
          : group
      )
    )
  }

  function changeCandidateType(groupKey: string, candidateType: CandidateType) {
    setSubcategories((groups) =>
      groups.map((group) =>
        group.key === groupKey && group.candidateType !== candidateType
          ? {
              ...group,
              candidateType,
              candidates: [newCandidate(), newCandidate()],
            }
          : group
      )
    )
  }

  function toggleClass(name: string) {
    setEligibleClasses((current) => {
      if (name === "All") return current.includes("All") ? [] : ["All"]
      const selected = current.filter((item) => item !== "All")
      return selected.includes(name)
        ? selected.filter((item) => item !== name)
        : [...selected, name]
    })
  }

  function submit() {
    const nextErrors = validateElectionDraft({
      title,
      academicSessionId,
      sessionIds: sessions.map((session) => session.Id),
      category,
      categories,
      eligibleClasses,
      classNames,
      voterTypes,
      subcategories,
    })
    setErrors(nextErrors)
    if (
      Object.keys(nextErrors).length ||
      (studentsVote && classesUnavailable) ||
      sessionsUnavailable ||
      !selectedSession ||
      profilesLoading
    )
      return
    const selectedCategory = categoryList.find((item) => item.name === category)
    if (!selectedCategory) return
    const allClasses = studentsVote && eligibleClasses.includes("All")
    createElection(
      {
        schoolId,
        title: title.trim(),
        electionCategoryId: selectedCategory.id,
        schoolSessionId: selectedSession.Id,
        voterType: studentsVote
          ? voterTypes.includes("staff")
            ? ElectionVoterType.StudentsAndStaff
            : ElectionVoterType.AllStudents
          : ElectionVoterType.AllStaff,
        isAllClassesEligible: studentsVote ? allClasses : true,
        eligibleClassIds:
          allClasses || !studentsVote
            ? undefined
            : classes
                .filter((item) => eligibleClasses.includes(item.ClsName))
                .map((item) => item.Id),
        status: ElectionStatus.Draft,
        subcategories: subcategories.map((group, index) => ({
          name: group.name.trim().replace(/\s+/g, " "),
          orderIndex: index + 1,
          candidates: group.candidates.map((candidate) => ({
            candidateType:
              group.candidateType === "staff"
                ? ApiCandidateType.Staff
                : ApiCandidateType.Student,
            studentId:
              group.candidateType === "staff" ? null : candidate.studentId,
            staffId: group.candidateType === "staff" ? candidate.staffId : null,
            manifesto: candidate.manifesto.trim() || undefined,
          })),
        })),
      },
      {
        onSuccess: () => {
          toast.success("Election created")
          goBack()
        },
      }
    )
  }

  return (
    <div className="space-y-5 py-6">
      <Button type="button" variant="ghost" onClick={goBack}>
        <ArrowLeft className="size-4" /> Back to elections
      </Button>
      <header>
        <h1 className="text-2xl font-bold">Create Election</h1>
        <p className="text-sm text-muted-foreground">
          Choose a category and eligible classes, then add subcategories and
          their candidates.
        </p>
      </header>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <section
          aria-labelledby="election-setup"
          className="space-y-5 rounded-xl border bg-white p-5"
        >
          <h2 id="election-setup" className="text-lg font-semibold">
            1. Category and eligible classes
          </h2>
          <div className="space-y-2">
            <Label htmlFor="election-category">
              Category{" "}
              <span className="text-red-600" aria-hidden="true">
                *
              </span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="election-category"
                aria-required="true"
                aria-invalid={!!errors.category}
                className="w-full rounded-lg border-chart-2/60 bg-chart-2/5 px-3 text-blue-700 transition-colors hover:border-chart-2 hover:bg-chart-2/10 focus-visible:border-chart-2 focus-visible:ring-2 focus-visible:ring-chart-2/25 data-placeholder:text-blue-700/70 data-[state=open]:border-chart-2 data-[state=open]:bg-chart-2/10 data-[state=open]:ring-2 data-[state=open]:ring-chart-2/20 [&_svg]:text-chart-2"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="border border-chart-2/40 bg-white p-1 shadow-lg ring-chart-2/10"
              >
                {categories.map((name) => (
                  <SelectItem
                    key={name}
                    value={name}
                    className="cursor-pointer px-3 py-2.5 text-blue-700 transition-colors hover:bg-chart-2/10 focus:bg-chart-2/10 focus:text-blue-800 data-[highlighted]:bg-chart-2/10 data-[highlighted]:text-blue-800 data-[state=checked]:bg-chart-2/20 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800"
                  >
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p role="alert" className="text-sm text-red-600">
                {errors.category}
              </p>
            )}
            <Link
              className="text-sm text-blue-600 underline"
              to={DashboardRoutes.toVotingCategories(productId)}
            >
              Manage categories
            </Link>
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-session">
              Academic session{" "}
              <span className="text-red-600" aria-hidden="true">
                *
              </span>
            </Label>
            <Select
              value={academicSessionId}
              onValueChange={setAcademicSessionId}
              disabled={sessionsUnavailable}
            >
              <SelectTrigger
                id="election-session"
                aria-required="true"
                aria-invalid={!!errors.session}
                className="w-full border-chart-2/60 bg-chart-2/5 text-blue-700 hover:border-chart-2 hover:bg-chart-2/10 focus-visible:border-chart-2 focus-visible:ring-chart-2/25 data-[state=open]:bg-chart-2/10 [&_svg]:text-chart-2"
              >
                <SelectValue
                  placeholder={
                    sessionsLoading
                      ? "Loading academic sessions..."
                      : "Select academic session"
                  }
                />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="border border-chart-2/40 bg-white p-1"
              >
                {sessions.map((session) => (
                  <SelectItem
                    key={session.Id}
                    value={session.Id}
                    className="cursor-pointer py-2.5 text-blue-700 focus:bg-chart-2/10 focus:text-blue-800 data-[state=checked]:bg-chart-2/20 data-[state=checked]:font-semibold"
                  >
                    {session.SessionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.session && (
              <p role="alert" className="text-sm text-red-600">
                {errors.session}
              </p>
            )}
            {(sessionsError || (!sessionsLoading && sessions.length === 0)) && (
              <div className="space-y-2">
                <p role="status" className="text-sm text-muted-foreground">
                  {sessionsError
                    ? "Academic sessions could not be loaded."
                    : "Add an academic session in school settings before creating an election."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!schoolId || sessionsFetching}
                  onClick={() => void refetchSessions()}
                >
                  {sessionsFetching ? "Refreshing..." : "Refresh sessions"}
                </Button>
              </div>
            )}
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">
              Who can vote{" "}
              <span className="text-red-600" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["Applicable to all students", ["student"]],
                  ["Applicable to all staff", ["staff"]],
                  ["Students and staff", ["student", "staff"]],
                ] as const
              ).map(([label, types]) => (
                <label key={label} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="election-voters"
                    checked={
                      voterTypes.length === types.length &&
                      types.every((type) => voterTypes.includes(type))
                    }
                    onChange={() => setVoterTypes([...types])}
                    className="size-4 accent-blue-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            {errors.voterTypes && (
              <p role="alert" className="text-sm text-red-600">
                {errors.voterTypes}
              </p>
            )}
          </fieldset>
          {studentsVote && (
            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-medium">
                Eligible classes{" "}
                <span className="text-red-600" aria-hidden="true">
                  *
                </span>
              </legend>

              <div className="flex flex-wrap gap-4">
                {["All", ...classNames.filter((name) => name !== "All")].map(
                  (name) => (
                    <label
                      key={name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={eligibleClasses.includes(name)}
                        onChange={() => toggleClass(name)}
                        className="size-4 accent-blue-600"
                      />
                      {name === "All" ? "All Classes" : name}
                    </label>
                  )
                )}
              </div>
              {(!schoolId ||
                isError ||
                (!isLoading && classNames.length === 0)) && (
                <>
                  <p role="status" className="text-xs text-muted-foreground">
                    {!schoolId
                      ? "The school could not be identified. Reopen the school from your dashboard."
                      : isError
                        ? "Classes could not be loaded. Refresh to try again."
                        : "Add a school class before creating an election."}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!schoolId || isFetching}
                    onClick={() => void refetch()}
                  >
                    {isFetching ? "Refreshing..." : "Refresh classes"}
                  </Button>
                </>
              )}
              {errors.classes && (
                <p role="alert" className="text-sm text-red-600">
                  {errors.classes}
                </p>
              )}
            </fieldset>
          )}
        </section>
        {ready ? (
          <section
            aria-labelledby="election-subcategories"
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="election-title">
                Election title{" "}
                <span className="text-red-600" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="election-title"
                aria-required="true"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Prefect Election 2026"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p role="alert" className="text-sm text-red-600">
                  {errors.title}
                </p>
              )}
            </div>
            <h2 id="election-subcategories" className="text-lg font-semibold">
              2. {category} subcategories and candidates
            </h2>
            <p className="text-sm text-muted-foreground">
              Each subcategory has its own candidates and results. A student can
              vote once in each subcategory.
            </p>
            {subcategories.map((group, groupIndex) => (
              <section
                key={group.key}
                aria-labelledby={`subcategory-${group.key}-heading`}
                className="space-y-4 rounded-xl border bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    id={`subcategory-${group.key}-heading`}
                    className="font-semibold"
                  >
                    Subcategory {groupIndex + 1}
                    {group.name.trim() ? `: ${group.name}` : ""}
                  </h3>
                  {subcategories.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            "Remove this subcategory and its candidate drafts?"
                          )
                        )
                          setSubcategories((groups) =>
                            groups.filter((item) => item.key !== group.key)
                          )
                      }}
                    >
                      <Trash2 className="size-4" /> Remove subcategory
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`subcategory-${group.key}`}>
                    Subcategory name{" "}
                    <span className="text-red-600" aria-hidden="true">
                      *
                    </span>
                  </Label>
                  <Input
                    id={`subcategory-${group.key}`}
                    aria-required="true"
                    value={group.name}
                    aria-invalid={!!errors[group.key]}
                    placeholder="e.g. Head Prefect or Sports Prefect"
                    onChange={(event) =>
                      setSubcategories((groups) =>
                        groups.map((item) =>
                          item.key === group.key
                            ? { ...item, name: event.target.value }
                            : item
                        )
                      )
                    }
                  />
                  {errors[group.key] && (
                    <p role="alert" className="text-sm text-red-600">
                      {errors[group.key]}
                    </p>
                  )}
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">
                    Candidates are
                  </legend>
                  <div className="flex gap-2">
                    {(
                      [
                        ["student", "Students"],
                        ["staff", "Teachers"],
                      ] as const
                    ).map(([type, label]) => (
                      <Button
                        key={type}
                        type="button"
                        size="sm"
                        variant={
                          group.candidateType === type ? "default" : "outline"
                        }
                        aria-pressed={group.candidateType === type}
                        onClick={() => changeCandidateType(group.key, type)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </fieldset>
                <h4 className="text-sm font-semibold">
                  Candidates for{" "}
                  {group.name.trim() || `subcategory ${groupIndex + 1}`}
                </h4>
                {errors[`${group.key}-candidates`] && (
                  <p role="alert" className="text-sm text-red-600">
                    {errors[`${group.key}-candidates`]}
                  </p>
                )}
                {group.candidates.map((candidate, index) => {
                  const shared = {
                    cand: candidate,
                    index,
                    errors,
                    canRemove: group.candidates.length > 2,
                    onRemove: () =>
                      setSubcategories((groups) =>
                        groups.map((item) =>
                          item.key === group.key
                            ? {
                                ...item,
                                candidates: item.candidates.filter(
                                  (entry) => entry.key !== candidate.key
                                ),
                              }
                            : item
                        )
                      ),
                    onChange: (patch: Partial<CandidateDraft>) =>
                      updateCandidate(group.key, candidate.key, patch),
                  }
                  return group.candidateType === "staff" ? (
                    <StaffCandidateEditor
                      key={candidate.key}
                      {...shared}
                      excludeStaffIds={group.candidates
                        .map((item) => item.staffId ?? "")
                        .filter(Boolean)}
                    />
                  ) : (
                    <ElectionCandidateEditor key={candidate.key} {...shared} />
                  )
                })}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSubcategories((groups) =>
                      groups.map((item) =>
                        item.key === group.key
                          ? {
                              ...item,
                              candidates: [...item.candidates, newCandidate()],
                            }
                          : item
                      )
                    )
                  }
                >
                  <Plus className="size-4" /> Add candidate to{" "}
                  {group.name.trim() || "subcategory"}
                </Button>
              </section>
            ))}
            {errors.subcategories && (
              <p role="alert" className="text-sm text-red-600">
                {errors.subcategories}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSubcategories((groups) => [...groups, newSubcategory()])
              }
            >
              <Plus className="size-4" /> Add subcategory
            </Button>
          </section>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            Select a category and eligible classes above to add subcategories
            and candidates.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={goBack}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !ready ||
              (studentsVote && classesUnavailable) ||
              sessionsUnavailable ||
              profilesLoading ||
              submitting
            }
          >
            {submitting ? "Creating..." : "Create Election"}
          </Button>
        </div>
      </form>
    </div>
  )
}
