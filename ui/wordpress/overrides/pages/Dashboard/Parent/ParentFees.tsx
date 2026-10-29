import { useCallback, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { CreditCard, Wallet } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterSelect } from "@/components/ui/filter-select"
import FundWalletModal from "@/pages/Dashboard/Parent/components/FundWalletModal"
import PaySchoolFeesModal from "@/pages/Dashboard/Parent/components/PaySchoolFeesModal"
import { ChildPaymentHistory } from "@/pages/Dashboard/Parent/components/ChildPaymentHistory"
import { ChildTab } from "@/pages/Dashboard/Parent/components/ChildTab"
import { ClassSelector } from "@/pages/Dashboard/Parent/components/ClassSelector"
import { SummaryCard } from "@/pages/Dashboard/Parent/components/SummaryCard"
import { TermCard } from "@/pages/Dashboard/Parent/components/TermCard"
import { useSchoolCurrency, useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetGuardianDetails,
  useGetGuardianChildren,
  useGetStudentFeeBreakdown,
} from "@/hooks/guardian"
import { useChildSessionTree } from "@/hooks/useChildSessionTree"
import { useParentPortalSelection } from "@/hooks/useParentPortalSelection"

import {
  formatClassOptionLabel,
  getCurrentPortalClass,
  mapLaunchPortalChildToGuardianChild,
  mapLaunchPortalFeeBreakdownToStudentFeeBreakdown,
} from "@/utils/guardianAdapter"
import type {
  LaunchSchoolPortalCurrentClassI,
  LaunchSchoolPortalDataI,
  StudentFeeBreakdownTermI,
} from "@/api/guardian.api/types"
import { queryKeys } from "@/utils/queryKeys"
import { normaliseCurrencyCode } from "@/utils/currency"

interface ParentFeesPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentFeesPage({
  parentIdOverride,
  portalOverride,
}: ParentFeesPageProps = {}) {
  const { parentId: routeParentId } = useParams<{
    productId: string
    parentId: string
  }>()
  const parentId = parentIdOverride ?? routeParentId
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const schoolId = useSchoolId()
  const schoolCurrency = useSchoolCurrency()
  const guardianId = parentId ?? ""

  const isPortalDriven =
    !!portalOverride && portalOverride.guardianId === guardianId

  const { guardian, isLoading: guardianDetailsLoading } = useGetGuardianDetails(
    {
      guardianId: isPortalDriven ? "" : guardianId,
    }
  )
  const guardianLoading = isPortalDriven ? false : guardianDetailsLoading
  const guardianFullName =
    portalOverride?.guardianFullName ?? guardian?.fullName ?? ""

  const { children: fetchedChildren, isLoading: fetchedChildrenLoading } =
    useGetGuardianChildren({
      guardianId: isPortalDriven ? "" : guardianId,
      schoolId,
    })
  const childrenLoading = isPortalDriven ? false : fetchedChildrenLoading
  const children = useMemo(() => {
    if (isPortalDriven) {
      return portalOverride!.children.map(mapLaunchPortalChildToGuardianChild)
    }
    return fetchedChildren
  }, [isPortalDriven, portalOverride, fetchedChildren])

  const {
    selectedChildId,
    selectedSessionId,
    selectedClass,
    selectChild: storeSelectChild,
    selectSession: storeSelectSession,
    selectClass: storeSelectClass,
  } = useParentPortalSelection(guardianId)
  const [termFilter, setTermFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const activeChildId = selectedChildId || children[0]?.studentId || ""
  const activeChild = children.find((c) => c.studentId === activeChildId)
  const activePortalChild = portalOverride?.children.find(
    (c) => c.studentId === activeChildId
  )
  const embeddedFeeBreakdown = activePortalChild?.activeSessionFeeBreakdown
    ? mapLaunchPortalFeeBreakdownToStudentFeeBreakdown(
        activePortalChild.activeSessionFeeBreakdown
      )
    : undefined

  const { sessions: childSessions } = useChildSessionTree({
    schoolId,
    activeChildId,

    portal: portalOverride,
  })

  const sessionOptions = useMemo(
    () => childSessions.map((s) => ({ value: s.id, label: s.name })),
    [childSessions]
  )
  const defaultSessionId = useMemo(() => {
    if (activeChild) {
      const matched = childSessions.find(
        (s) => s.name === activeChild.currentSession
      )
      if (matched) return matched.id
    }
    const current = childSessions.find((s) => s.isCurrent)
    return current?.id ?? ""
  }, [childSessions, activeChild])

  const activeSessionId = selectedSessionId || defaultSessionId
  const isExplicitSessionSelection = !!selectedSessionId
  const activeSession = childSessions.find((s) => s.id === activeSessionId)

  // Union of the selected session's terms' classes (Fees has no term selector)
  const sessionClasses = useMemo(() => {
    const byEnrollmentId = new Map<string, LaunchSchoolPortalCurrentClassI>()
    for (const term of activeSession?.terms ?? []) {
      for (const cls of term.classes) byEnrollmentId.set(cls.enrollmentId, cls)
    }
    return Array.from(byEnrollmentId.values())
  }, [activeSession])
  const classOptions = useMemo(
    () =>
      sessionClasses.map((c) => ({
        value: c.enrollmentId,
        label: `${formatClassOptionLabel(c.className, c.armName)}${c.isCurrent ? " (Current)" : ""}`,
      })),
    [sessionClasses]
  )
  const activeClassEnrollmentId =
    selectedClass?.enrollmentId &&
    classOptions.some((o) => o.value === selectedClass.enrollmentId)
      ? selectedClass.enrollmentId
      : activePortalChild
        ? (getCurrentPortalClass(activePortalChild)?.enrollmentId ?? "")
        : ""
  const activeClassObj = sessionClasses.find(
    (c) => c.enrollmentId === activeClassEnrollmentId
  )

  const isExplicitClassSelection = !!selectedClass?.enrollmentId

  const usesEmbeddedBreakdown =
    isPortalDriven &&
    !!embeddedFeeBreakdown &&
    activeSessionId === embeddedFeeBreakdown.sessionId &&
    !isExplicitClassSelection

  const needsFetch =
    !usesEmbeddedBreakdown &&
    !!activeSessionId &&
    (!isPortalDriven || isExplicitSessionSelection || isExplicitClassSelection)
  const showSessionPrompt =
    isPortalDriven && !usesEmbeddedBreakdown && !needsFetch

  const [fundWalletOpen, setFundWalletOpen] = useState(false)
  const [paymentTerm, setPaymentTerm] =
    useState<StudentFeeBreakdownTermI | null>(null)

  const {
    feeBreakdown: realFeeBreakdown,
    isLoading: realFeeLoading,
    isFetching: realFeeFetching,
    isError: realFeeError,
    refetch: refetchFeeBreakdown,
  } = useGetStudentFeeBreakdown(
    {
      guardianId,
      schoolId,
      studentId: activeChildId,
      schoolSessionId: activeSessionId,
      classId: activeClassObj?.schoolClassId,
    },
    needsFetch
  )

  const feeBreakdown = usesEmbeddedBreakdown
    ? embeddedFeeBreakdown
    : realFeeBreakdown
  const feeLoading = needsFetch && (realFeeLoading || realFeeFetching)
  const feeError = needsFetch && realFeeError

  const selectChild = useCallback(
    (id: string) => {
      storeSelectChild(id)
      setTermFilter("all")
      setExpandedId(null)
    },
    [storeSelectChild]
  )

  const selectSession = useCallback(
    (id: string) => {
      storeSelectSession(id)
      setTermFilter("all")
      setExpandedId(null)
    },
    [storeSelectSession]
  )

  const handleToggleTerm = useCallback((id: string) => {
    setExpandedId((p) => (p === id ? null : id))
  }, [])

  const selectClass = useCallback(
    (enrollmentId: string) => {
      const cls = sessionClasses.find((c) => c.enrollmentId === enrollmentId)
      storeSelectClass(cls ?? null)
      setExpandedId(null)
    },
    [sessionClasses, storeSelectClass]
  )

  // Embedded breakdown covers every class at once, so pick the matching group client-side; the explicit-fetch path sends classId server-side instead
  const embeddedClassGroup =
    activeClassObj && embeddedFeeBreakdown
      ? embeddedFeeBreakdown.classFeeBreakdowns.find(
          (c) => c.classId === activeClassObj.schoolClassId
        )
      : undefined

  const terms = embeddedClassGroup
    ? embeddedClassGroup.terms
    : (feeBreakdown?.terms ?? [])
  const termOptions = [
    { value: "all", label: "All Terms" },
    ...Array.from(new Set(terms.map((term) => term.termName))).map((name) => ({
      value: name,
      label: name,
    })),
  ]
  const visibleTerms =
    termFilter === "all"
      ? terms
      : terms.filter((term) => term.termName === termFilter)
  if (guardianLoading || childrenLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Loading parent...
      </div>
    )
  }

  if (!isPortalDriven && !guardian) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Parent not found.
      </div>
    )
  }

  const summary = feeBreakdown
    ? {
        walletBalance: feeBreakdown.walletBalance,
        totalBilled:
          embeddedClassGroup?.totalBilled ?? feeBreakdown.totalBilled,
        totalPaid: embeddedClassGroup?.totalPaid ?? feeBreakdown.totalPaid,
        outstandingBalance:
          embeddedClassGroup?.outstandingBalance ??
          feeBreakdown.outstandingBalance,
      }
    : undefined
  const outstandingBalanceDisplay =
    summary?.outstandingBalance ??
    (isPortalDriven ? (portalOverride?.totalPendingFees ?? 0) : 0)
  const currencyCode = normaliseCurrencyCode(
    feeBreakdown?.currencyCode ?? portalOverride?.baseCurrency ?? schoolCurrency
  )

  const refreshParentFees = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [queryKeys.studentFeeBreakdown],
      }),
      queryClient.invalidateQueries({
        queryKey: [queryKeys.guardianFeeManagement],
      }),
      queryClient.invalidateQueries({
        queryKey: [queryKeys.launchSchoolPortal],
      }),
      queryClient.invalidateQueries({
        queryKey: ["parent-child-fee-history", schoolId, activeChildId],
      }),
    ])
    if (needsFetch) await refetchFeeBreakdown()
  }

  return (
    <div>
      <PageHeader
        title="School Fees"
        description={guardianFullName}
        onBack={parentIdOverride ? undefined : () => navigate(-1)}
        className="mb-7"
        actions={
          children.length > 0 ? (
            <Button
              variant="primary"
              onClick={() => setFundWalletOpen(true)}
              className="w-full justify-center sm:w-auto"
            >
              <Wallet className="size-4" />
              Fund Wallet
            </Button>
          ) : undefined
        }
      />

      {children.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No children linked"
          description="This guardian has no children linked at this school yet."
          size="sm"
        />
      ) : (
        <>
          {/* Child tabs + session selector */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
              {children.map((child) => (
                <ChildTab
                  key={child.studentId}
                  child={child}
                  active={child.studentId === activeChildId}
                  onClick={selectChild}
                />
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {sessionOptions.length > 0 && (
                <FilterSelect
                  value={activeSessionId}
                  onChange={selectSession}
                  options={sessionOptions}
                  placeholder="Select session"
                  triggerClassName="h-9 w-40"
                />
              )}
              <ClassSelector
                options={classOptions}
                value={activeClassEnrollmentId}
                onChange={selectClass}
              />
              {termOptions.length > 2 && (
                <FilterSelect
                  value={termFilter}
                  onChange={setTermFilter}
                  options={termOptions}
                  placeholder="Select term"
                  triggerClassName="h-9 w-36"
                />
              )}
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <SummaryCard
              label="Wallet Balance"
              amount={summary?.walletBalance ?? 0}
              color="blue"
              currencyCode={currencyCode}
            />
            <SummaryCard
              label="Total Billed"
              amount={summary?.totalBilled ?? 0}
              color="gray"
              currencyCode={currencyCode}
            />
            <SummaryCard
              label="Total Paid"
              amount={summary?.totalPaid ?? 0}
              color="green"
              currencyCode={currencyCode}
            />
            <SummaryCard
              label="Outstanding Balance"
              amount={outstandingBalanceDisplay}
              color={outstandingBalanceDisplay > 0 ? "red" : "green"}
              highlight={outstandingBalanceDisplay > 0}
              currencyCode={currencyCode}
            />
          </div>

          {/* Term list */}
          <div className="space-y-3">
            {showSessionPrompt ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
                <CreditCard
                  size={36}
                  className="mb-3 text-gray-300 dark:text-gray-600"
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Select a session to view fee details
                </p>
                <p className="mt-1 max-w-sm text-xs text-gray-400 dark:text-gray-500">
                  Pick a session above to see{" "}
                  {activeChild?.fullName ?? "this child"}'s invoices and payment
                  status.
                </p>
              </div>
            ) : feeLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 dark:border-white/10 dark:bg-white/3">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Loading fees...
                </p>
              </div>
            ) : feeError ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
                <CreditCard
                  size={36}
                  className="mb-3 text-gray-300 dark:text-gray-600"
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  No school fees assigned yet
                </p>
                <p className="mt-1 max-w-sm text-xs text-gray-400 dark:text-gray-500">
                  {activeChild?.fullName ?? "This child"} doesn't have any fees
                  assigned for this term yet. Once your school publishes fees,
                  they will show up here.
                </p>
                {sessionOptions.length > 1 && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    You can also try selecting a different session above.
                  </p>
                )}
              </div>
            ) : terms.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
                <CreditCard
                  size={36}
                  className="mb-3 text-gray-300 dark:text-gray-600"
                />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No invoices found
                </p>
              </div>
            ) : visibleTerms.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
                <CreditCard
                  size={36}
                  className="mb-3 text-gray-300 dark:text-gray-600"
                />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No invoices for {termFilter}
                </p>
              </div>
            ) : (
              visibleTerms.map((term) => (
                <TermCard
                  key={term.schoolSessionTermId}
                  term={term}
                  studentName={activeChild?.fullName ?? ""}
                  studentClass={
                    activeClassObj
                      ? formatClassOptionLabel(
                          activeClassObj.className,
                          activeClassObj.armName
                        )
                      : (activeChild?.currentClass ?? "")
                  }
                  parentName={guardianFullName}
                  currencyCode={currencyCode}
                  expanded={expandedId === term.schoolSessionTermId}
                  onToggle={handleToggleTerm}
                  onPayNow={setPaymentTerm}
                />
              ))
            )}
          </div>
          {isPortalDriven && (
            <ChildPaymentHistory
              schoolId={schoolId}
              studentId={activeChildId}
              sessionId={activeSessionId || undefined}
              currencyCode={currencyCode}
            />
          )}
        </>
      )}

      <FundWalletModal
        open={fundWalletOpen}
        onClose={() => setFundWalletOpen(false)}
        guardianChildren={children}
        defaultChildId={activeChildId}
        currencyCode={currencyCode}
        returnUrl={
          typeof window === "undefined"
            ? `/parent-home/${schoolId}/fees`
            : window.location.pathname
        }
      />

      <PaySchoolFeesModal
        open={!!paymentTerm}
        onClose={() => setPaymentTerm(null)}
        schoolId={schoolId}
        studentId={activeChildId}
        studentName={activeChild?.fullName ?? "Student"}
        walletBalance={summary?.walletBalance ?? 0}
        currencyCode={currencyCode}
        term={paymentTerm}
        onWalletPaymentComplete={refreshParentFees}
      />
    </div>
  )
}
