import { useState } from "react"
import {
  Badge,
  Check,
  ErrorBox,
  Field,
  Modal,
  Note,
  PersonPicker,
  SaveForm,
  Select,
  TextField,
  label,
  today,
  useData,
  type Request,
  type Row,
} from "./shared"
export function Review({
  request,
  id,
  back,
  open,
}: {
  request: Request
  id: string
  back: () => void
  open: (id: string) => void
}) {
  const [dirty, setDirty] = useState(false),
    [tick, setTick] = useState(0),
    [tab, setTab] = useState("Goals"),
    [action, setAction] = useState(""),
    [note, setNote] = useState(""),
    [goal, setGoal] = useState<Row | null>(null),
    [check, setCheck] = useState(false),
    [assign, setAssign] = useState(false)
  const {
    data: r,
    error,
    loading,
  } = useData(request, `Reviews/${id}`, {}, tick)
  const refresh = () => {
    setDirty(false)
    setTick((x) => x + 1)
  }
  if (loading) return <p>Loading review…</p>
  if (error || !r)
    return (
      <>
        <button onClick={back}>Back</button>
        <ErrorBox message={error} />
      </>
    )
  const rights = r.rights,
    active =
      r.cycle.status === "Active" &&
      !["Superseded", "Cancelled"].includes(r.status),
    author = rights.employee || rights.reviewer,
    actions: string[] = []
  if (active) {
    if (
      author &&
      r.status === "Planning" &&
      !(rights.employee
        ? r.employeeGoalsAgreedAtUtc
        : r.reviewerGoalsAgreedAtUtc)
    )
      actions.push("AgreeGoals")
    if (rights.employee && r.status === "InProgress") actions.push("SubmitSelf")
    if (
      rights.reviewer &&
      (r.status === "SelfSubmitted" ||
        (!r.cycle.requireSelfAssessment && r.status === "InProgress"))
    )
      actions.push("SubmitManager")
    if (rights.reviewer && r.status === "SelfSubmitted")
      actions.push("ReturnSelf")
    if (rights.approver && r.status === "ManagerSubmitted")
      actions.push("Approve", "ReturnManager")
    if (rights.employee && r.status === "Approved") actions.push("Acknowledge")
    if (rights.employee && ["Approved", "Acknowledged"].includes(r.status))
      actions.push("Dispute")
    if (rights.disputeHandler && r.status === "Disputed")
      actions.push("Resolve")
    if (
      (rights.admin || rights.disputeHandler) &&
      !rights.employee &&
      r.approvedAtUtc
    )
      actions.push("Revise")
  }
  const titles: Row = {
    AgreeGoals: "Agree goals",
    SubmitSelf: "Submit self-assessment",
    SubmitManager: "Submit manager review",
    ReturnSelf: "Return self-assessment",
    ReturnManager: "Return manager review",
    Approve: "Approve and release",
    Acknowledge: "Acknowledge receipt",
    Dispute: "Record disagreement",
    Resolve: "Record resolution",
    Revise: "Create corrected revision",
  }
  return (
    <>
      <button disabled={dirty} onClick={back}>
        ← Back to reviews
      </button>
      <header className="ep-review-head">
        <div>
          <span className="ep-eyebrow">
            {r.reviewPeriod} · REVISION {r.revision} · TEMPLATE v
            {r.cycle.templateVersion}
          </span>
          <h2>{r.staffName}</h2>
          <p>
            Reviewer: {r.reviewerName} · Due {r.cycle.reviewDue}
          </p>
        </div>
        <Badge value={r.status} />
      </header>
      <div className="ep-steps">
        {[
          "Planning",
          "InProgress",
          "SelfSubmitted",
          "ManagerSubmitted",
          "Approved",
          "Acknowledged",
        ].map((s, i) => (
          <span key={s} className={s === r.status ? "current" : ""}>
            {i + 1}. {label(s)}
          </span>
        ))}
      </div>
      {r.previousReviewId && (
        <button onClick={() => open(r.previousReviewId)}>
          View preserved previous revision
        </button>
      )}
      <div className="ep-actions">
        {dirty && (
          <p>
            Save your assessment draft before leaving this section or changing
            the review stage.
          </p>
        )}
        {actions.map((a) => (
          <button
            disabled={dirty}
            key={a}
            className={a === "Approve" ? "ep-primary" : ""}
            onClick={() => {
              setNote("")
              setAction(a)
            }}
          >
            {titles[a]}
          </button>
        ))}
        {rights.admin && active && (
          <button disabled={dirty} onClick={() => setAssign(true)}>
            Manage assignments
          </button>
        )}
      </div>
      <nav className="ep-tabs" aria-label="Review sections">
        {[
          "Goals",
          "Check-ins",
          "Self-assessment",
          "Manager review",
          "Outcome & history",
          "Development",
        ].map((t) => (
          <button
            aria-current={tab === t ? "page" : undefined}
            key={t}
            disabled={dirty && t !== tab}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {(tab === "Goals" || tab === "Development") && (
        <>
          <div className="ep-row">
            <div>
              <h3>
                {tab === "Goals" ? "Agreed expectations" : "Development plan"}
              </h3>
              {tab === "Goals" && (
                <p>
                  Employee:{" "}
                  {r.employeeGoalsAgreedAtUtc ? "agreed" : "awaiting agreement"}{" "}
                  · Reviewer:{" "}
                  {r.reviewerGoalsAgreedAtUtc ? "agreed" : "awaiting agreement"}
                </p>
              )}
            </div>
            {author &&
              !["Superseded", "Cancelled"].includes(r.status) &&
              (tab === "Development" ||
                ["Planning", "InProgress"].includes(r.status)) && (
                <button
                  onClick={() =>
                    setGoal({
                      id: null,
                      kind: tab === "Goals" ? "Goal" : "Development",
                      title: "",
                      dueDate: r.cycle.endsOn,
                      status: "not-started",
                      details: {
                        outcome: "",
                        measure: "",
                        support: "",
                        ownerUserId: r.employeeUserId,
                        progress: 0,
                      },
                      reason: "",
                    })
                  }
                >
                  Add {tab === "Goals" ? "goal" : "development action"}
                </button>
              )}
          </div>
          {r.goals
            .filter(
              (g: Row) => g.kind === (tab === "Goals" ? "Goal" : "Development")
            )
            .map((g: Row) => (
              <article key={g.id} className="ep-card">
                <div className="ep-row">
                  <h4>{g.title}</h4>
                  <Badge value={g.status} />
                </div>
                <p>{g.details.outcome}</p>
                <p>
                  <strong>Success measure:</strong> {g.details.measure}
                </p>
                <p>
                  <strong>Support:</strong> {g.details.support || "—"}
                </p>
                <p>
                  Due {g.dueDate} · {g.details.progress}% complete · Owner:{" "}
                  {g.details.ownerUserId === r.employeeUserId
                    ? r.staffName
                    : g.details.ownerUserId === r.reviewerUserId
                      ? r.reviewerName
                      : g.details.ownerUserId}
                </p>
                <progress max={100} value={g.details.progress} />
                {author &&
                  !["Superseded", "Cancelled"].includes(r.status) &&
                  (g.kind === "Development" ||
                    ["Planning", "InProgress"].includes(r.status)) && (
                    <button
                      onClick={() =>
                        setGoal({ ...structuredClone(g), reason: "" })
                      }
                    >
                      Update
                    </button>
                  )}
              </article>
            ))}
          {!r.goals.some(
            (g: Row) => g.kind === (tab === "Goals" ? "Goal" : "Development")
          ) && (
            <p className="ep-empty">
              {tab === "Goals"
                ? "Agree at least one measurable goal before starting the assessments."
                : "Record training, mentoring and support actions here."}
            </p>
          )}
        </>
      )}
      {tab === "Check-ins" && (
        <>
          <div className="ep-row">
            <h3>Progress conversations</h3>
            {author && active && (
              <button onClick={() => setCheck(true)}>Record check-in</button>
            )}
          </div>
          {r.checkIns.map((c: Row) => (
            <article key={c.id} className="ep-card">
              <div className="ep-row">
                <strong>{c.date}</strong>
                <Badge value={c.visibility} />
              </div>
              <p>{c.progress}</p>
              {["achievements", "barriers", "support"].map(
                (k) =>
                  c[k] && (
                    <p key={k}>
                      <strong>{label(k)}:</strong> {c[k]}
                    </p>
                  )
              )}
            </article>
          ))}
          {!r.checkIns.length && (
            <p className="ep-empty">
              No check-ins recorded. Capture progress, barriers and the support
              agreed.
            </p>
          )}
        </>
      )}
      {(tab === "Self-assessment" || tab === "Manager review") && (
        <Assessment
          key={tab + tick}
          request={request}
          r={r}
          stage={tab === "Self-assessment" ? "Self" : "Manager"}
          refresh={refresh}
          onDirty={() => setDirty(true)}
        />
      )}
      {tab === "Outcome & history" && (
        <>
          <article className="ep-card">
            <h3>Review outcome</h3>
            <p>
              {r.approvedAtUtc
                ? `Approved ${new Date(r.approvedAtUtc).toLocaleString()}`
                : "Awaiting approval. The employee receives the manager assessment after approval."}
            </p>
            {r.score && (
              <>
                <strong className="ep-score">
                  {r.score.score == null
                    ? "Feedback only"
                    : `${r.score.score}%`}
                </strong>
                <p>
                  {r.approvedAtUtc ? "Approved result" : "Draft calculation"} ·
                  Unassessed criteria are excluded and remaining weights are
                  rescaled.
                </p>
                <div className="ep-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Criterion</th>
                        <th>Weight</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.score.breakdown.map((x: Row) => (
                        <tr key={x.key}>
                          <td>{x.label}</td>
                          <td>{x.weight}%</td>
                          <td>
                            {x.excluded
                              ? "Not assessed"
                              : (x.score ?? "Unscored")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <p>
              <strong>Employee comment:</strong> {r.employeeComment || "—"}
            </p>
            <p>
              <strong>Resolution:</strong> {r.resolution || "—"}
            </p>
            <p className="ep-muted">
              Acknowledgement confirms receipt. Payroll changes require a
              separate manual payroll decision.
            </p>
          </article>
          <h3>Activity history</h3>
          {r.audit
            .slice()
            .reverse()
            .map((x: Row, i: number) => (
              <div className="ep-timeline" key={i}>
                <strong>{label(x.action)}</strong>
                <time>{new Date(x.atUtc).toLocaleString()}</time>
                <p>{x.note}</p>
              </div>
            ))}
        </>
      )}
      {action && (
        <Modal title={titles[action]} close={() => setAction("")}>
          <SaveForm
            text={titles[action]}
            save={async () => {
              const result = await request(`Reviews/${id}/${action}`, "POST", {
                version: r.version,
                note,
              })
              setAction("")
              if (result.revisionId) open(result.revisionId)
              else refresh()
            }}
          >
            <p>
              {action === "Acknowledge"
                ? "Confirm that you received and discussed this review. You can record disagreement separately."
                : action === "Approve"
                  ? "Approval locks the assessment and releases it to the employee. Corrections require a new revision."
                  : action === "Revise"
                    ? "The current assessment remains preserved. A new revision will require a fresh manager assessment and approval."
                    : action === "AgreeGoals"
                      ? "Confirm that the goals, measures, deadlines and support are agreed. Changing them later requires renewed agreement."
                      : "Save assessment drafts before submitting. This action is recorded in the review history."}
            </p>
            <Note
              title="Note / reason"
              required
              value={note}
              onChange={setNote}
            />
          </SaveForm>
        </Modal>
      )}
      {goal && (
        <Modal
          title={goal.id ? "Update goal" : "New goal"}
          close={() => setGoal(null)}
        >
          <GoalForm
            initial={goal}
            r={r}
            save={async (body) => {
              await request(`Reviews/${id}/Goals`, "PUT", {
                ...body,
                version: r.version,
              })
              setGoal(null)
              refresh()
            }}
          />
        </Modal>
      )}
      {check && (
        <Modal title="Record check-in" close={() => setCheck(false)}>
          <CheckInForm
            r={r}
            save={async (body) => {
              await request(`Reviews/${id}/CheckIns`, "POST", {
                ...body,
                version: r.version,
              })
              setCheck(false)
              refresh()
            }}
          />
        </Modal>
      )}
      {assign && (
        <Modal title="Review assignments" close={() => setAssign(false)}>
          <Assignments
            request={request}
            r={r}
            save={async (body) => {
              await request(`Reviews/${id}/Assignments`, "PUT", {
                ...body,
                version: r.version,
              })
              setAssign(false)
              refresh()
            }}
          />
        </Modal>
      )}
    </>
  )
}
function GoalForm({
  initial,
  r,
  save,
}: {
  initial: Row
  r: Row
  save: (x: Row) => Promise<void>
}) {
  const [v, setV] = useState(initial)
  const set = (k: string, x: any) => setV({ ...v, [k]: x }),
    detail = (k: string, x: any) => set("details", { ...v.details, [k]: x })
  return (
    <SaveForm save={() => save(v)}>
      <TextField
        title="Title"
        value={v.title}
        onChange={(x) => set("title", x)}
      />
      <Note
        title="Expected outcome"
        required
        value={v.details.outcome}
        onChange={(x) => detail("outcome", x)}
      />
      <Note
        title="Success measure"
        required
        value={v.details.measure}
        onChange={(x) => detail("measure", x)}
      />
      <Note
        title="Support / training required"
        value={v.details.support}
        onChange={(x) => detail("support", x)}
      />
      <div className="ep-grid">
        <TextField
          title="Due date"
          type="date"
          value={v.dueDate}
          onChange={(x) => set("dueDate", x)}
        />
        <Select
          title="Owner"
          value={v.details.ownerUserId}
          onChange={(x) => detail("ownerUserId", x)}
          options={[
            { value: r.employeeUserId, label: r.staffName },
            { value: r.reviewerUserId, label: r.reviewerName },
          ]}
        />
        <Select
          title="Status"
          value={v.status}
          onChange={(x) =>
            setV({
              ...v,
              status: x,
              details: {
                ...v.details,
                progress: x === "completed" ? 100 : v.details.progress,
              },
            })
          }
          options={["not-started", "in-progress", "completed"].map((x) => ({
            value: x,
            label: label(x),
          }))}
        />
        <TextField
          title="Progress (%)"
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={v.details.progress}
          onChange={(x) => detail("progress", Number(x))}
        />
      </div>
      <Note
        title="Reason / progress note"
        required
        value={v.reason}
        onChange={(x) => set("reason", x)}
      />
    </SaveForm>
  )
}
function CheckInForm({ r, save }: { r: Row; save: (x: Row) => Promise<void> }) {
  const [v, setV] = useState<Row>({
    date: today(),
    progress: "",
    achievements: "",
    barriers: "",
    support: "",
    visibility: "Shared",
  })
  return (
    <SaveForm save={() => save(v)}>
      <TextField
        title="Conversation date"
        type="date"
        value={v.date}
        onChange={(x) => setV({ ...v, date: x })}
      />
      {["progress", "achievements", "barriers", "support"].map((k) => (
        <Note
          key={k}
          title={label(k)}
          required={k === "progress"}
          value={v[k]}
          onChange={(x) => setV({ ...v, [k]: x })}
        />
      ))}
      {r.rights.reviewer && !r.rights.employee && (
        <Select
          title="Visibility"
          value={v.visibility}
          onChange={(x) => setV({ ...v, visibility: x })}
          options={[
            { value: "Shared", label: "Employee and review team" },
            {
              value: "Reviewers",
              label: "Reviewer, approver and administrator only",
            },
          ]}
        />
      )}
      <p>
        Check-ins are retained as an activity history; add a follow-up to
        correct a note.
      </p>
    </SaveForm>
  )
}
function Assignments({
  request,
  r,
  save,
}: {
  request: Request
  r: Row
  save: (x: Row) => Promise<void>
}) {
  const [v, setV] = useState<Row>({
    reviewer: { userId: r.reviewerUserId, name: r.reviewerName },
    approver: { userId: r.approverUserId },
    dispute: { userId: r.disputeHandlerUserId },
    reason: "",
  })
  return (
    <SaveForm
      save={() =>
        save({
          reviewerUserId: v.reviewer.userId,
          approverUserId: v.approver.userId,
          disputeHandlerUserId: v.dispute.userId,
          reason: v.reason,
        })
      }
    >
      {(r.approvedAtUtc
        ? ["dispute"]
        : ["reviewer", "approver", "dispute"]
      ).map((k) => (
        <PersonPicker
          key={k}
          request={request}
          title={label(k)}
          value={v[k]}
          onChange={(x) => setV({ ...v, [k]: x })}
        />
      ))}
      <Note
        title="Reason for reassignment"
        required
        value={v.reason}
        onChange={(x) => setV({ ...v, reason: x })}
      />
      <p>
        Changing the reviewer clears the manager draft and approval submission.
        Published reviews keep their original reviewer and approver.
      </p>
    </SaveForm>
  )
}
function Assessment({
  request,
  r,
  stage,
  refresh,
  onDirty,
}: {
  request: Request
  r: Row
  stage: string
  refresh: () => void
  onDirty: () => void
}) {
  const original = stage === "Self" ? r.selfAnswers : r.managerAnswers,
    [answers, setAnswers] = useState<Row[]>(original || []),
    [fileError, setFileError] = useState(""),
    [uploading, setUploading] = useState(false),
    [dirty, setDirty] = useState(false)
  const editable =
    r.cycle.status === "Active" &&
    (stage === "Self"
      ? r.rights.employee && r.status === "InProgress"
      : r.rights.reviewer &&
        !r.rights.employee &&
        ["InProgress", "SelfSubmitted"].includes(r.status))
  const change = (key: string, k: string, value: any) => {
    setDirty(true)
    onDirty()
    const found = answers.find((a) => a.key === key) || {
      key,
      choice: null,
      number: null,
      text: null,
      checked: [],
      notAssessed: false,
      evidenceIds: [],
    }
    setAnswers([
      ...answers.filter((a) => a.key !== key),
      { ...found, [k]: value },
    ])
  }
  if (original === null)
    return (
      <p className="ep-empty">
        This assessment is private until{" "}
        {stage === "Self"
          ? "the employee submits it"
          : "it is approved and released"}
        .
      </p>
    )
  const download = async (doc: Row) => {
    setFileError("")
    try {
      const d = await request(`Reviews/${r.id}/Documents/${doc.id}`)
      const bytes = Uint8Array.from(atob(d.base64), (c) => c.charCodeAt(0))
      const url = URL.createObjectURL(
        new Blob([bytes], { type: d.contentType })
      )
      const a = document.createElement("a")
      a.href = url
      a.download = d.fileName
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e: any) {
      setFileError(e.message)
    }
  }
  const content = (
    <>
      <p>{r.definition.instructions}</p>
      {r.definition.policyReference && (
        <p className="ep-muted">Policy: {r.definition.policyReference}</p>
      )}
      {r.definition.criteria.map((c: Row) => {
        const a = answers.find((x) => x.key === c.key) || {
          key: c.key,
          choice: null,
          number: null,
          text: "",
          checked: [],
          notAssessed: false,
          evidenceIds: [],
        }
        return (
          <article className="ep-card" key={c.key}>
            <span className="ep-eyebrow">
              {c.section}
              {r.definition.scored ? ` · ${c.weight}% weight` : ""}
            </span>
            <h4>
              {c.label}
              {c.required ? " *" : ""}
            </h4>
            {c.allowNotAssessed && (
              <Check
                title="Not assessed — explain below"
                value={a.notAssessed}
                disabled={!editable}
                onChange={(x) => change(c.key, "notAssessed", x)}
              />
            )}
            <fieldset disabled={!editable || a.notAssessed}>
              {c.kind === "Rating" && (
                <>
                  <Select
                    title="Rating"
                    value={a.choice}
                    required={false}
                    options={r.definition.scale.map((s: Row) => ({
                      value: s.key,
                      label: s.label,
                    }))}
                    onChange={(x) => change(c.key, "choice", x || null)}
                  />
                  <p className="ep-muted">
                    {
                      r.definition.scale.find((s: Row) => s.key === a.choice)
                        ?.description
                    }
                  </p>
                </>
              )}
              {["Number", "Percentage"].includes(c.kind) && (
                <TextField
                  title={`Value (${c.minimum}–${c.maximum})`}
                  type="number"
                  step="any"
                  min={c.minimum}
                  max={c.maximum}
                  required={false}
                  value={a.number}
                  onChange={(x) =>
                    change(c.key, "number", x === "" ? null : Number(x))
                  }
                />
              )}{" "}
              {c.kind === "Checklist" && (
                <>
                  {c.options.map((o: string) => (
                    <Check
                      key={o}
                      title={o}
                      value={(a.checked || []).includes(o)}
                      onChange={(x) =>
                        change(
                          c.key,
                          "checked",
                          x
                            ? [...(a.checked || []), o]
                            : (a.checked || []).filter((s: string) => s !== o)
                        )
                      }
                    />
                  ))}
                  {editable && !answers.some((x) => x.key === c.key) && (
                    <button
                      type="button"
                      onClick={() => change(c.key, "checked", [])}
                    >
                      Confirm none checked
                    </button>
                  )}
                </>
              )}
            </fieldset>
            <fieldset disabled={!editable}>
              <Note
                title={
                  a.notAssessed
                    ? "Reason not assessed"
                    : c.kind === "Text"
                      ? "Written response"
                      : "Evidence / explanation"
                }
                value={a.text}
                onChange={(x) => change(c.key, "text", x)}
              />
              <Field
                title={
                  c.kind === "Evidence"
                    ? "Select evidence files"
                    : "Supporting files (optional)"
                }
              >
                <select
                  multiple
                  value={a.evidenceIds || []}
                  onChange={(e) =>
                    change(
                      c.key,
                      "evidenceIds",
                      Array.from(e.target.selectedOptions).map((o) => o.value)
                    )
                  }
                >
                  {r.documents.map((d: Row) => (
                    <option key={d.id} value={d.id}>
                      {d.fileName}
                    </option>
                  ))}
                </select>
              </Field>
            </fieldset>
            {(a.evidenceIds || []).map((id: string) => {
              const doc = r.documents.find((d: Row) => d.id === id)
              return doc ? (
                <button type="button" key={id} onClick={() => download(doc)}>
                  Download {doc.fileName}
                </button>
              ) : null
            })}
          </article>
        )
      })}
    </>
  )
  return (
    <>
      {editable ? (
        <SaveForm
          text="Save assessment draft"
          save={async () => {
            await request(`Reviews/${r.id}/${stage}`, "PUT", {
              version: r.version,
              answers,
            })
            refresh()
          }}
        >
          {content}
        </SaveForm>
      ) : (
        content
      )}
      <section className="ep-card">
        <h3>Private evidence</h3>
        <p>
          PDF, PNG or JPEG, up to 5 MB each. Save your draft before uploading.
          Select uploaded files against the relevant criteria.
        </p>
        <ErrorBox message={fileError} />
        {editable && (
          <Field title={uploading ? "Uploading…" : "Upload evidence"}>
            <input
              type="file"
              disabled={dirty || uploading}
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setFileError("")
                setUploading(true)
                try {
                  if (file.size > 5242880)
                    throw Error("Maximum file size is 5 MB")
                  const bytes = new Uint8Array(await file.arrayBuffer())
                  let text = ""
                  for (let i = 0; i < bytes.length; i += 32768)
                    text += String.fromCharCode(...bytes.subarray(i, i + 32768))
                  await request(`Reviews/${r.id}/Documents`, "POST", {
                    version: r.version,
                    kind:
                      stage === "Self"
                        ? "performance-self"
                        : "performance-manager",
                    fileName: file.name,
                    base64: btoa(text),
                  })
                  refresh()
                } catch (e: any) {
                  setFileError(e.message)
                } finally {
                  setUploading(false)
                }
              }}
            />
          </Field>
        )}
        {dirty && <p>Save the current draft to enable uploads.</p>}
        {r.documents.map((d: Row) => (
          <div className="ep-row" key={d.id}>
            <span>
              {d.fileName} · {label(d.kind)}
            </span>
            <button type="button" onClick={() => download(d)}>
              Download
            </button>
          </div>
        ))}
      </section>
    </>
  )
}
