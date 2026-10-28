import { useEffect, useState } from "react"
import { healthActions } from "./actions"
import {
  ActionDialog,
  Badge,
  Empty,
  LoadState,
  Pager,
  date,
  time,
  roles,
  visitStatus,
  incidentStatus,
  medStatus,
  outcome,
  today,
  useData,
  useHealthRefresh,
  healthMenuPath,
  type FormSpec,
  type Request,
  type Row,
} from "./shared"
import "./HealthApp.css"

type Props = {
  request: Request
  schoolId: string
  initialPath?: string
  navigate?: (path: string) => void
  allowedMenuPaths: string[]
}
export default function HealthApp({
  request,
  schoolId,
  initialPath = "/dashboard/health",
  navigate,
  allowedMenuPaths,
}: Props) {
  const tail =
    initialPath
      .split("/health")[1]
      ?.split("?")[0]
      ?.split("/")
      .filter(Boolean) ?? []
  const mode =
    tail[0] === "records" && tail[1] ? "detail" : (tail[0] ?? "overview")
  const studentId = tail[0] === "records" ? (tail[1] ?? "") : ""
  const [tab, setTab] = useState("visits"),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [term, setTerm] = useState(""),
    [classId, setClassId] = useState(""),
    [status, setStatus] = useState(""),
    [overdue, setOverdue] = useState(false),
    [form, setForm] = useState<FormSpec | null>(null),
    [notice, setNotice] = useState(""),
    [actionError, setActionError] = useState("")
  const [revision, refresh] = useHealthRefresh()
  const [expiredEmergency, setExpiredEmergency] = useState("")
  const menuPath = healthMenuPath(initialPath)
  const menuAllowed = allowedMenuPaths.includes(menuPath)
  const canOpenStudent = allowedMenuPaths.includes("/dashboard/health/records")
  const canFollowUp =
    canOpenStudent || allowedMenuPaths.includes("/dashboard/health/incidents")
  const canContact =
    canFollowUp || allowedMenuPaths.includes("/dashboard/health/sick-bay")
  const base = `/HealthRecord/schools/${schoolId}`
  useEffect(() => {
    setPage(1)
    setStatus("")
    setSearch("")
    setTab("visits")
    setForm(null)
  }, [initialPath])
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])
  const setup = useData(
    request,
    schoolId && menuAllowed ? `${base}/workflow-setup` : null,
    { menuPath },
    revision
  )
  const detail = useData(
    request,
    menuAllowed && mode === "detail" && studentId
      ? `${base}/students/${studentId}/workspace`
      : null,
    {},
    revision
  )
  const clinicalAccess =
      mode === "detail" && detail.data
        ? detail.data.access
        : (setup.data?.access ?? {}),
    emergencyExpired =
      !!clinicalAccess.emergencyAccessExpiresAtUtc &&
      clinicalAccess.emergencyAccessExpiresAtUtc === expiredEmergency,
    access =
      menuAllowed &&
      ![401, 403, 404].includes(setup.error?.status ?? 0) &&
      !emergencyExpired &&
      !(mode === "detail" && detail.error?.status === 403)
        ? clinicalAccess
        : {},
    canView = !!access.canViewRecords
  const overview = useData(
    request,
    mode === "overview" && canView ? "/HealthRecord/Overview" : null,
    { schoolId },
    revision
  )
  const records = useData(
    request,
    mode === "records" && canView
      ? "/HealthRecord/StudentRecords/GetAll"
      : null,
    {
      schoolId,
      pageNumber: page,
      pageSize: 20,
      searchString: term || undefined,
      classId: classId || undefined,
    },
    revision
  )
  const visits = useData(
    request,
    (mode === "sick-bay" || (mode === "detail" && tab === "visits")) && canView
      ? "/HealthRecord/SickBay/GetAll"
      : null,
    {
      schoolId,
      studentSchoolId: mode === "detail" ? studentId : undefined,
      pageNumber: page,
      pageSize: 20,
      searchString: mode === "sick-bay" ? term || undefined : undefined,
      status: status === "" ? undefined : Number(status),
    },
    revision
  )
  const kind = mode === "overview" || mode === "incidents" ? "incidents" : tab
  const timeline = useData(
    request,
    canView &&
      (["overview", "incidents"].includes(mode) ||
        (mode === "detail" &&
          ["incidents", "administrations", "contacts", "audit"].includes(tab)))
      ? `${base}/timeline`
      : null,
    {
      kind,
      studentSchoolId: mode === "detail" ? studentId : undefined,
      pageNumber: page,
      pageSize: mode === "overview" ? 5 : 20,
      status:
        mode === "overview"
          ? undefined
          : status === ""
            ? undefined
            : Number(status),
      overdueOnly: mode === "overview" ? true : overdue,
    },
    revision
  )
  const grants = useData(
    request,
    mode === "access" && access.canConfigureAccess
      ? `${base}/access-grants`
      : null,
    {},
    revision
  )
  const alerts = useData(
    request,
    mode === "access" && access.canConfigureAccess
      ? `${base}/security-alerts`
      : null,
    {},
    revision
  )
  const actions = healthActions(
    request,
    schoolId,
    studentId,
    detail.data ?? {},
    setup.data?.staff ?? [],
    setForm
  )
  const lead = [1, 2].includes(access.accessRole)
  const act = (fn: () => unknown) => {
    setActionError("")
    Promise.resolve()
      .then(fn)
      .catch((e) =>
        setActionError(
          e instanceof Error ? e.message : "Unable to complete the action."
        )
      )
  }
  function go(next: string, id = "") {
    setNotice("")
    setActionError("")
    setSearch("")
    setStatus("")
    setPage(1)
    setOverdue(false)
    setTab("visits")
    if (next === "detail" && !canOpenStudent) return
    if (navigate)
      navigate(
        `/dashboard/health${next === "detail" ? "/records/" + id : next === "overview" ? "" : "/" + next}`
      )
  }
  function changeTab(next: string) {
    setTab(next)
    setPage(1)
    setStatus("")
    setOverdue(false)
  }
  const profile = detail.data?.profile ?? {}
  const expires = clinicalAccess.emergencyAccessExpiresAtUtc
  useEffect(() => {
    if (!expires) return
    const timer = setTimeout(
      () => {
        setExpiredEmergency(expires)
        setForm(null)
        refresh()
      },
      Math.max(0, new Date(expires).getTime() - Date.now()) + 100
    )
    return () => clearTimeout(timer)
  }, [expires, refresh])
  useEffect(() => {
    if (
      !menuAllowed ||
      setup.error?.status === 403 ||
      setup.error?.status === 401 ||
      detail.error?.status === 403 ||
      (setup.data &&
        !setup.data.access?.canViewRecords &&
        !setup.data.access?.canConfigureAccess &&
        !detail.data?.access?.isEmergencyAccess)
    )
      setForm(null)
  }, [menuAllowed, setup.error, setup.data, detail.error, detail.data])
  const incidentRows = (rows: Row[] = []) =>
    rows.length ? (
      rows.map((x) => {
        const r = x.record
        const isOverdue =
          r.status !== 4 &&
          r.followUpAtUtc &&
          new Date(r.followUpAtUtc) < new Date()
        return (
          <article className="hw-record" key={r.id}>
            <div className="row">
              <div>
                {mode !== "detail" && (
                  <button
                    className="hw-link"
                    disabled={!canOpenStudent}
                    onClick={() => go("detail", x.studentSchoolId)}
                  >
                    {x.studentName}
                  </button>
                )}
                <h3>
                  {
                    [
                      "",
                      "Illness",
                      "Injury",
                      "Allergic reaction",
                      "Medication error",
                      "Mental wellbeing",
                      "Other",
                    ][r.type]
                  }{" "}
                  <Badge tone={r.severity >= 3 ? "bad" : "neutral"}>
                    {["", "Low", "Moderate", "High", "Critical"][r.severity]}
                  </Badge>
                </h3>
              </div>
              <Badge tone={r.status === 4 ? "good" : "blue"}>
                {incidentStatus[r.status]}
              </Badge>
            </div>
            <p>{r.description}</p>
            <p>
              <strong>Action:</strong> {r.firstAidOrActionTaken}
            </p>
            {r.outcomeOrFollowUp && (
              <p>
                <strong>Follow-up:</strong> {r.outcomeOrFollowUp}
              </p>
            )}
            <div className="hw-muted">
              {time(r.occurredAtUtc)} · Recorded by{" "}
              {r.recordedByName || "Authorised staff"}
            </div>
            <p className="hw-muted">
              Owner:{" "}
              {setup.data?.staff?.find((s: Row) => s.id === r.assignedToUserId)
                ?.name ??
                (r.assignedToUserId
                  ? "Assigned staff member"
                  : "Unassigned")}{" "}
              · Follow-up: {time(r.followUpAtUtc)}{" "}
              {isOverdue && <Badge tone="warn">Overdue</Badge>}
            </p>
            {r.closureNotes && (
              <div className="hw-note">
                Closed {time(r.closedAtUtc)} · {r.closureNotes}
              </div>
            )}
            <div className="actions">
              {canFollowUp &&
                access.canRecordIncidents &&
                !access.isEmergencyAccess && (
                  <button onClick={() => act(() => actions.followUp(r))}>
                    Update follow-up
                  </button>
                )}
              {canContact && access.canRecordIncidents && (
                <button
                  onClick={() =>
                    act(() =>
                      actions.contact(r, "HealthIncident", x.studentSchoolId)
                    )
                  }
                >
                  Parent contact
                </button>
              )}
            </div>
          </article>
        )
      })
    ) : (
      <Empty>No incidents match these filters.</Empty>
    )
  const visitRows = (rows: Row[] = []) =>
    rows.length ? (
      <div className="hw-table">
        <table>
          <thead>
            <tr>
              <th>Student / time</th>
              <th>Visit and action</th>
              <th>Outcome</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <button
                    className="hw-link"
                    disabled={!canOpenStudent}
                    onClick={() => go("detail", r.studentSchoolId)}
                  >
                    {r.studentName}
                  </button>
                  <small>{time(r.visitDate)}</small>
                  <small>{r.attendedBy}</small>
                </td>
                <td>
                  <strong>{r.complaint}</strong>
                  <small>{r.treatment}</small>
                  {r.additionalNotes && <small>{r.additionalNotes}</small>}
                </td>
                <td>
                  <Badge tone={r.status === 0 ? "warn" : "good"}>
                    {visitStatus[r.status]}
                  </Badge>
                  <small>
                    {r.isParentNotified
                      ? "Parent contact recorded"
                      : "No confirmed parent contact"}
                  </small>
                </td>
                <td>
                  {access.canRecordIncidents && (
                    <>
                      <button
                        onClick={() =>
                          act(() =>
                            actions.contact(r, "SickBayLog", r.studentSchoolId)
                          )
                        }
                      >
                        Parent contact
                      </button>
                      {r.status === 0 && (
                        <button onClick={() => act(() => actions.discharge(r))}>
                          Discharge / refer
                        </button>
                      )}
                      {access.canManageProfiles && (
                        <button
                          className="danger"
                          onClick={() => act(() => actions.voidVisit(r))}
                        >
                          Void
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <Empty>No sick-bay visits match these filters.</Empty>
    )
  return (
    <main className="hw">
      <header className="hw-hero">
        <div>
          <p className="hw-eyebrow">STUDENT WELLBEING</p>
          <h1>
            {mode === "detail"
              ? profile.studentName || "Student health"
              : "Health & care"}
          </h1>
          <p>
            {mode === "detail"
              ? `${profile.className || "Student record"} · Care, communication and follow-up`
              : "Support every student. Keep every action connected."}
          </p>
        </div>
        <div>
          <button onClick={refresh}>Refresh</button>
        </div>
      </header>
      {notice && (
        <div className="hw-success" role="status">
          {notice}
        </div>
      )}
      {actionError && (
        <div className="hw-alert" role="alert">
          {actionError}
        </div>
      )}
      {!menuAllowed ? (
        <div className="hw-alert" role="alert">
          This Health menu is not assigned to your role. Ask your school
          administrator to assign the menu to a role and assign that role to
          your account.
        </div>
      ) : (
        <LoadState state={setup} retry={refresh}>
          {emergencyExpired ? (
            <div className="hw-alert" role="alert">
              Emergency access has expired. Refresh to check your current
              access.
            </div>
          ) : mode === "detail" ? (
            <>
              {detail.error?.status === 403 &&
              setup.data?.access?.isSchoolMember ? (
                <div className="hw-card">
                  <section>
                    <h2>Restricted health record</h2>
                    <p>
                      Ask a health access manager for the appropriate role.
                      Temporary access is available for a genuine emergency
                      involving this student.
                    </p>
                    <button onClick={() => act(actions.emergency)}>
                      Emergency access
                    </button>
                  </section>
                </div>
              ) : (
                <LoadState state={detail} retry={refresh}>
                  {access.isEmergencyAccess && (
                    <div className="hw-expired">
                      Emergency access expires at {time(expires)}. Every view
                      and action is audited.
                    </div>
                  )}
                  <div className="hw-card">
                    <header>
                      <div>
                        <h2>Health summary</h2>
                        <p className="description">
                          Key information for this student
                        </p>
                      </div>
                      <div>
                        {access.canManageProfiles && (
                          <button onClick={() => act(actions.profile)}>
                            Edit profile
                          </button>
                        )}{" "}
                        {access.canRecordIncidents && (
                          <button
                            className="primary"
                            onClick={() => act(actions.visit)}
                          >
                            Log visit
                          </button>
                        )}
                      </div>
                    </header>
                    <section>
                      <div className="hw-details">
                        {[
                          ["allergies", "Allergies"],
                          ["chronicConditions", "Long-term conditions"],
                          ["disabilities", "Disabilities"],
                          ["bloodGroup", "Blood group"],
                          ["genotype", "Genotype"],
                          ["specialNeedsDescription", "Support needs"],
                        ].map(([key, label]) => (
                          <div key={key}>
                            <small>{label}</small>
                            <p>{profile[key] || "Not recorded"}</p>
                          </div>
                        ))}
                      </div>
                      {(profile.emergencyInstructions ||
                        profile.emergencyContactPhone ||
                        profile.requiresEmergencyMedication) && (
                        <div className="hw-emergency">
                          <strong>
                            Emergency information{" "}
                            {profile.requiresEmergencyMedication &&
                              " · Emergency medication required"}
                          </strong>
                          <p>
                            {profile.emergencyInstructions ||
                              "No specific instructions recorded."}
                          </p>
                          <p>
                            {profile.emergencyContactName}{" "}
                            {profile.emergencyContactRelationship} ·{" "}
                            {profile.emergencyContactPhone ||
                              "No telephone recorded"}
                          </p>
                        </div>
                      )}
                    </section>
                  </div>
                  <nav className="hw-nav" aria-label="Student health sections">
                    {[
                      ["visits", "Visits"],
                      ["care-plans", "Care plans"],
                      ["medication", "Medication"],
                      ["administrations", "Administration history"],
                      ["incidents", "Incidents"],
                      ["consent", "Consent"],
                      ["contacts", "Parent contact"],
                      ["audit", "Audit"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        className={tab === id ? "active" : ""}
                        onClick={() => changeTab(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                  {tab === "visits" && (
                    <div className="hw-card">
                      <header>
                        <h2>Sick-bay history</h2>
                      </header>
                      <LoadState state={visits} retry={refresh}>
                        {visitRows(visits.data?.items)}
                        <Pager
                          data={visits.data}
                          page={page}
                          setPage={setPage}
                        />
                      </LoadState>
                    </div>
                  )}
                  {tab === "care-plans" && (
                    <div className="hw-card">
                      <header>
                        <h2>Individual care plans</h2>
                        {access.canManageCarePlans && (
                          <button
                            className="primary"
                            onClick={() => act(actions.carePlan)}
                          >
                            New plan version
                          </button>
                        )}
                      </header>
                      {detail.data?.carePlans?.length ? (
                        detail.data.carePlans.map((r: Row) => (
                          <article className="hw-record" key={r.id}>
                            <div className="row">
                              <h3>{r.title}</h3>
                              <Badge tone={r.status === 2 ? "good" : "neutral"}>
                                v{r.version} ·{" "}
                                {
                                  [
                                    "",
                                    "Draft",
                                    "Active",
                                    "Superseded",
                                    "Closed",
                                  ][r.status]
                                }
                              </Badge>
                            </div>
                            <p>{r.healthSummary}</p>
                            <div className="hw-emergency">
                              <strong>Emergency instructions</strong>
                              <p>{r.emergencyInstructions}</p>
                            </div>
                            <p>Daily support: {r.dailySupport || "—"}</p>
                            <p>
                              Trips and activities:{" "}
                              {r.activitiesAndTripsInstructions || "—"}
                            </p>
                            <small>
                              Effective {date(r.effectiveFrom)} · Review{" "}
                              {date(r.reviewDate)}{" "}
                              {r.status === 2 && r.reviewDate < today() && (
                                <Badge tone="warn">Review overdue</Badge>
                              )}
                            </small>
                          </article>
                        ))
                      ) : (
                        <Empty>No care plan recorded.</Empty>
                      )}
                    </div>
                  )}
                  {tab === "medication" && (
                    <div className="hw-card">
                      <header>
                        <div>
                          <h2>Medication authorisations</h2>
                          <p className="description">
                            Current consent is checked before an administration
                            is saved.
                          </p>
                        </div>
                        {lead && (
                          <button
                            className="primary"
                            onClick={() => act(actions.medication)}
                          >
                            Authorise medication
                          </button>
                        )}
                      </header>
                      {detail.data?.medicationAuthorisations?.length ? (
                        detail.data.medicationAuthorisations.map((r: Row) => {
                          const expired = r.endDate && r.endDate < today()
                          return (
                            <article className="hw-record" key={r.id}>
                              <div className="row">
                                <h3>
                                  {r.medicationName}{" "}
                                  {r.isEmergencyMedication && (
                                    <Badge tone="bad">Emergency</Badge>
                                  )}
                                </h3>
                                <Badge
                                  tone={
                                    r.status === 2 && !expired ? "good" : "warn"
                                  }
                                >
                                  {expired
                                    ? "Expired by date"
                                    : medStatus[r.status]}
                                </Badge>
                              </div>
                              <p>
                                <strong>{r.dose}</strong> · {r.route} ·{" "}
                                {r.frequency}
                              </p>
                              <p>{r.instructions}</p>
                              <small>
                                Valid {date(r.startDate)} –{" "}
                                {r.endDate ? date(r.endDate) : "ongoing"} ·
                                Storage:{" "}
                                {r.storageInstructions || "Not recorded"}
                              </small>
                              <div className="actions">
                                {access.canManageMedication &&
                                  r.status === 2 &&
                                  !expired &&
                                  r.startDate <= today() && (
                                    <button
                                      className="primary"
                                      onClick={() =>
                                        act(() => actions.administration(r))
                                      }
                                    >
                                      Record dose / outcome
                                    </button>
                                  )}
                                {lead && r.status !== 5 && (
                                  <button
                                    onClick={() =>
                                      act(() => actions.medicationStatus(r))
                                    }
                                  >
                                    Suspend / resume / revoke
                                  </button>
                                )}
                              </div>
                            </article>
                          )
                        })
                      ) : (
                        <Empty>
                          No medication authorisations. Record consent before
                          authorising medication.
                        </Empty>
                      )}
                    </div>
                  )}
                  {tab === "administrations" && (
                    <div className="hw-card">
                      <header>
                        <h2>Administration history</h2>
                      </header>
                      <LoadState state={timeline} retry={refresh}>
                        {timeline.data?.items?.length ? (
                          timeline.data.items.map((entry: Row) => {
                            const original = entry.original,
                              latest = entry.corrections[0],
                              r = latest?.values ?? original
                            return (
                              <article className="hw-record" key={original.id}>
                                <div className="row">
                                  <h3>{original.medicationName}</h3>
                                  <Badge tone={latest ? "warn" : "neutral"}>
                                    {latest
                                      ? "Corrected · v" + latest.version
                                      : "Original entry"}
                                  </Badge>
                                </div>
                                <p>
                                  {outcome[r.outcome]} ·{" "}
                                  {r.doseGiven || "No dose recorded"} ·{" "}
                                  {time(r.administeredAtUtc)}
                                </p>
                                <p>{r.notes}</p>
                                <small>
                                  Recorded by{" "}
                                  {original.administeredByName ||
                                    "Authorised staff"}
                                </small>
                                {latest && (
                                  <details>
                                    <summary>
                                      Original entry and correction history
                                    </summary>
                                    <p>
                                      Original: {outcome[original.outcome]} ·{" "}
                                      {original.doseGiven} ·{" "}
                                      {time(original.administeredAtUtc)} ·{" "}
                                      {original.notes}
                                    </p>
                                    {entry.corrections.map((c: Row) => (
                                      <p key={c.id}>
                                        v{c.version} · {time(c.dateCreated)} ·{" "}
                                        {c.actorName}: {c.reason}
                                        <br />
                                        {outcome[c.values.outcome]} ·{" "}
                                        {c.values.doseGiven} ·{" "}
                                        {time(c.values.administeredAtUtc)} ·{" "}
                                        {c.values.notes}
                                      </p>
                                    ))}
                                  </details>
                                )}
                                {lead && (
                                  <div className="actions">
                                    <button
                                      onClick={() =>
                                        act(() => actions.correction(entry))
                                      }
                                    >
                                      Append correction
                                    </button>
                                  </div>
                                )}
                              </article>
                            )
                          })
                        ) : (
                          <Empty>No administrations recorded.</Empty>
                        )}
                        <Pager
                          data={timeline.data}
                          page={page}
                          setPage={setPage}
                        />
                      </LoadState>
                    </div>
                  )}
                  {tab === "incidents" && (
                    <div className="hw-card">
                      <header>
                        <h2>Health incidents</h2>
                        {access.canRecordIncidents && (
                          <button
                            className="primary"
                            onClick={() => act(actions.incident)}
                          >
                            Record incident
                          </button>
                        )}
                      </header>
                      <LoadState state={timeline} retry={refresh}>
                        {incidentRows(timeline.data?.items)}
                        <Pager
                          data={timeline.data}
                          page={page}
                          setPage={setPage}
                        />
                      </LoadState>
                    </div>
                  )}
                  {tab === "consent" && (
                    <div className="hw-card">
                      <header>
                        <h2>Consent history</h2>
                        {access.canManageConsent && (
                          <button
                            className="primary"
                            onClick={() => act(actions.consent)}
                          >
                            Record decision
                          </button>
                        )}
                      </header>
                      {detail.data?.consents?.length ? (
                        detail.data.consents.map((r: Row) => (
                          <article className="hw-record" key={r.id}>
                            <div className="row">
                              <h3>
                                {
                                  [
                                    "",
                                    "Emergency treatment",
                                    "Medication administration",
                                    "Information sharing",
                                    "Health screening",
                                    "Off-site care",
                                    "Other",
                                  ][r.type]
                                }
                              </h3>
                              <Badge tone={r.status === 2 ? "good" : "warn"}>
                                {
                                  [
                                    "",
                                    "Pending",
                                    "Granted",
                                    "Declined",
                                    "Withdrawn",
                                    "Expired",
                                  ][r.status]
                                }{" "}
                                · v{r.version}
                              </Badge>
                            </div>
                            <p>{r.scope}</p>
                            <p>
                              {r.guardianName} · Evidence:{" "}
                              {r.evidenceMethod || "Not recorded"}
                            </p>
                            <small>
                              Valid {date(r.validFrom)} –{" "}
                              {r.validUntil ? date(r.validUntil) : "ongoing"} ·
                              Responded {time(r.respondedAtUtc)}
                            </small>
                          </article>
                        ))
                      ) : (
                        <Empty>No consent recorded.</Empty>
                      )}
                    </div>
                  )}
                  {tab === "contacts" && (
                    <div className="hw-card">
                      <header>
                        <h2>Parent contact history</h2>
                      </header>
                      <LoadState state={timeline} retry={refresh}>
                        {timeline.data?.items?.length ? (
                          timeline.data.items.map((r: Row) => (
                            <article className="hw-record" key={r.id}>
                              <div className="row">
                                <h3>{r.contact.recipientName}</h3>
                                <Badge
                                  tone={
                                    r.contact.method === "Portal" &&
                                    !r.portalRead
                                      ? "blue"
                                      : "good"
                                  }
                                >
                                  {r.contact.method === "Portal"
                                    ? r.portalRead
                                      ? "Portal · Read"
                                      : "Portal · Sent, unread"
                                    : r.contact.method + " · Contact recorded"}
                                </Badge>
                              </div>
                              <p>
                                {r.contact.notes ||
                                  "A private notification was sent to the guardian’s portal inbox."}
                              </p>
                              <small>
                                {time(r.contact.contactedAtUtc)} · Recorded by{" "}
                                {r.actorName} ·{" "}
                                {r.contact.entityType === "HealthIncident"
                                  ? "Incident"
                                  : "Sick-bay visit"}
                              </small>
                            </article>
                          ))
                        ) : (
                          <Empty>
                            Use “Parent contact” on a visit or incident to
                            record contact or send a portal notification.
                          </Empty>
                        )}
                        <Pager
                          data={timeline.data}
                          page={page}
                          setPage={setPage}
                        />
                      </LoadState>
                    </div>
                  )}
                  {tab === "audit" && (
                    <div className="hw-card">
                      <header>
                        <h2>Audit history</h2>
                      </header>
                      <LoadState state={timeline} retry={refresh}>
                        {timeline.data?.items?.map((r: Row) => (
                          <article className="hw-record" key={r.id}>
                            <h3>{r.summary}</h3>
                            <p>{r.reason}</p>
                            <small>
                              {r.actorName || "Authorised user"} ·{" "}
                              {time(r.dateCreated)}{" "}
                              {r.isEmergencyAccess && (
                                <Badge tone="warn">Emergency access</Badge>
                              )}
                            </small>
                          </article>
                        ))}
                        <Pager
                          data={timeline.data}
                          page={page}
                          setPage={setPage}
                        />
                      </LoadState>
                    </div>
                  )}
                </LoadState>
              )}
            </>
          ) : mode === "access" ? (
            <div className="hw-grid">
              <div className="hw-card">
                <header>
                  <h2>Health access</h2>
                  {access.canConfigureAccess && (
                    <button
                      className="primary"
                      onClick={() => act(() => actions.grant())}
                    >
                      Grant access
                    </button>
                  )}
                </header>
                <LoadState state={grants} retry={refresh}>
                  {grants.data?.length ? (
                    grants.data.map((r: Row) => (
                      <article className="hw-record" key={r.id}>
                        <h3>{r.userName || r.email}</h3>
                        <p>
                          {roles[r.role]} · {r.isActive ? "Active" : "Revoked"}{" "}
                          ·{" "}
                          {r.expiresAtUtc
                            ? "Expires " + time(r.expiresAtUtc)
                            : "No expiry"}
                        </p>
                        <button onClick={() => act(() => actions.grant(r))}>
                          Edit / revoke
                        </button>
                      </article>
                    ))
                  ) : (
                    <Empty>
                      No health access grants. Grant an appropriate role before
                      opening clinical records.
                    </Empty>
                  )}
                </LoadState>
              </div>
              <div className="hw-card">
                <header>
                  <h2>Security alerts</h2>
                </header>
                <LoadState state={alerts} retry={refresh}>
                  {alerts.data?.length ? (
                    alerts.data.map((r: Row) => (
                      <article className="hw-record" key={r.id}>
                        <h3>{r.title}</h3>
                        <p>{r.message}</p>
                        <small>{time(r.dateCreated)}</small>
                        {!r.acknowledgedAtUtc && (
                          <div className="actions">
                            <button
                              onClick={() =>
                                act(async () => {
                                  await request(
                                    `${base}/security-alerts/${r.id}/acknowledge`,
                                    "POST",
                                    {}
                                  )
                                  refresh()
                                })
                              }
                            >
                              Acknowledge
                            </button>
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <Empty>No security alerts.</Empty>
                  )}
                </LoadState>
              </div>
            </div>
          ) : !canView ? (
            <div className="hw-card">
              <section>
                <h2>Health access is required</h2>
                <p>
                  Clinical records are restricted to authorised health staff.{" "}
                  {access.canConfigureAccess
                    ? "Use Access & audit in the sidebar to assign an appropriate clinical role. Menu access is assigned through User Management roles."
                    : "Ask the school health access manager to review your role."}
                </p>
              </section>
            </div>
          ) : (
            <>
              {mode === "overview" && (
                <>
                  <LoadState state={overview} retry={refresh}>
                    <div className="hw-stats">
                      {[
                        ["Student profiles", overview.data?.totalHealthRecords],
                        ["In sick bay", overview.data?.currentlyAdmitted],
                        ["Allergy flags", overview.data?.allergyFlags],
                        [
                          "Long-term conditions",
                          overview.data?.chronicConditions,
                        ],
                      ].map(([label, value]) => (
                        <div className="hw-stat" key={label}>
                          <span>{label}</span>
                          <strong>{value ?? 0}</strong>
                        </div>
                      ))}
                    </div>
                  </LoadState>
                  <div className="hw-card">
                    <header>
                      <div>
                        <h2>Follow-up needs attention</h2>
                        <p className="description">
                          Open incidents with an overdue follow-up date
                        </p>
                      </div>
                    </header>
                    <LoadState state={timeline} retry={refresh}>
                      {incidentRows(timeline.data?.items)}
                    </LoadState>
                  </div>
                  <div className="hw-note">
                    Start with a student record to log a visit, record an
                    incident or review care instructions. Parent contact and
                    medication corrections are retained in the audit history.
                  </div>
                </>
              )}
              {mode === "records" && (
                <>
                  <div className="hw-toolbar">
                    <input
                      aria-label="Search students"
                      placeholder="Search students by name…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                      aria-label="Filter by class"
                      value={classId}
                      onChange={(e) => {
                        setClassId(e.target.value)
                        setPage(1)
                      }}
                    >
                      <option value="">All classes</option>
                      {setup.data?.classes?.map((r: Row) => (
                        <option value={r.id} key={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="hw-card">
                    <LoadState state={records} retry={refresh}>
                      {records.data?.items?.length ? (
                        <div className="hw-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Health flags</th>
                                <th>Record</th>
                              </tr>
                            </thead>
                            <tbody>
                              {records.data.items.map((r: Row) => (
                                <tr key={r.studentSchoolId}>
                                  <td>
                                    <button
                                      className="hw-link"
                                      disabled={!canOpenStudent}
                                      onClick={() =>
                                        go("detail", r.studentSchoolId)
                                      }
                                    >
                                      {r.studentName}
                                    </button>
                                  </td>
                                  <td>{r.className || "—"}</td>
                                  <td>
                                    {r.allergies && (
                                      <Badge tone="warn">Allergy</Badge>
                                    )}{" "}
                                    {r.chronicConditions && (
                                      <Badge tone="blue">
                                        Long-term condition
                                      </Badge>
                                    )}{" "}
                                    {!r.id && <Badge>Profile needed</Badge>}
                                  </td>
                                  <td>
                                    <button
                                      disabled={!canOpenStudent}
                                      onClick={() =>
                                        go("detail", r.studentSchoolId)
                                      }
                                    >
                                      Open workspace
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <Empty>No students match your search.</Empty>
                      )}
                      <Pager
                        data={records.data}
                        page={page}
                        setPage={setPage}
                      />
                    </LoadState>
                  </div>
                </>
              )}
              {mode === "sick-bay" && (
                <>
                  <div className="hw-toolbar">
                    <input
                      aria-label="Search visits"
                      placeholder="Search student, complaint or staff…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                      aria-label="Visit status"
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value)
                        setPage(1)
                      }}
                    >
                      <option value="">All outcomes</option>
                      {visitStatus.map((x, i) => (
                        <option key={x} value={i}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="hw-card">
                    <LoadState state={visits} retry={refresh}>
                      {visitRows(visits.data?.items)}
                      <Pager data={visits.data} page={page} setPage={setPage} />
                    </LoadState>
                  </div>
                </>
              )}
              {mode === "incidents" && (
                <>
                  <div className="hw-toolbar">
                    <select
                      aria-label="Incident status"
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value)
                        setPage(1)
                      }}
                    >
                      <option value="">All statuses</option>
                      {incidentStatus.map(
                        (x, i) =>
                          x && (
                            <option key={x} value={i}>
                              {x}
                            </option>
                          )
                      )}
                    </select>
                    <label>
                      <input
                        type="checkbox"
                        checked={overdue}
                        onChange={(e) => {
                          setOverdue(e.target.checked)
                          setPage(1)
                        }}
                      />{" "}
                      Overdue follow-ups only
                    </label>
                  </div>
                  <div className="hw-card">
                    <LoadState state={timeline} retry={refresh}>
                      {incidentRows(timeline.data?.items)}
                      <Pager
                        data={timeline.data}
                        page={page}
                        setPage={setPage}
                      />
                    </LoadState>
                  </div>
                </>
              )}
            </>
          )}
        </LoadState>
      )}
      {form && (
        <ActionDialog
          spec={form}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null)
            setNotice("Record saved successfully.")
            refresh()
          }}
        />
      )}
    </main>
  )
}
