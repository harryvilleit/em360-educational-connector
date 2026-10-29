import { useState } from "react"
import { Cycles } from "./Cycles"
import { Templates } from "./Templates"
import { Review } from "./Review"
import {
  Badge,
  ErrorBox,
  Pager,
  Select,
  csv,
  label,
  useData,
  type Request,
  type Row,
} from "./shared"
import css from "./performance.css?inline"
export default function PerformanceApp({
  request,
  initialStaffId,
}: {
  request: Request
  initialStaffId?: string
}) {
  const { data: setup, error, loading } = useData(request, "Setup"),
    [tab, setTab] = useState("Reviews"),
    [id, setId] = useState(""),
    [cycle, setCycle] = useState("")
  return (
    <section className="em-perf">
      <style>{css}</style>
      <header className="ep-page-head">
        <div>
          <span className="ep-eyebrow">STAFF MANAGEMENT</span>
          <h1>Performance & development</h1>
          <p>Clear expectations. Regular conversations. Meaningful growth.</p>
        </div>
        <span className="ep-mark">PEOPLE & GROWTH</span>
      </header>
      <ErrorBox message={error} />
      {loading ? (
        <p>Loading your workspace…</p>
      ) : (
        setup && (
          <>
            {id ? (
              <Review
                key={id}
                request={request}
                id={id}
                back={() => setId("")}
                open={setId}
              />
            ) : (
              <>
                <nav className="ep-tabs" aria-label="Performance workspace">
                  {[
                    "Reviews",
                    ...(setup.admin ? ["Templates", "Cycles", "Reports"] : []),
                    "Legacy history",
                  ].map((t) => (
                    <button
                      key={t}
                      aria-current={tab === t ? "page" : undefined}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </nav>
                {tab === "Reviews" && (
                  <ReviewList
                    request={request}
                    admin={setup.admin}
                    open={setId}
                    cycleId={cycle}
                    clearCycle={() => setCycle("")}
                    staffId={initialStaffId}
                  />
                )}{" "}
                {tab === "Templates" && <Templates request={request} />}{" "}
                {tab === "Cycles" && (
                  <Cycles
                    request={request}
                    openReviews={(x) => {
                      setCycle(x)
                      setTab("Reviews")
                    }}
                  />
                )}
                {tab === "Reports" && <Reports request={request} />}{" "}
                {tab === "Legacy history" && (
                  <History request={request} staffId={initialStaffId} />
                )}
              </>
            )}
          </>
        )
      )}
    </section>
  )
}
function ReviewList({
  request,
  admin,
  open,
  cycleId,
  clearCycle,
  staffId,
}: {
  request: Request
  admin: boolean
  open: (id: string) => void
  cycleId: string
  clearCycle: () => void
  staffId?: string
}) {
  const [mode, setMode] = useState(admin ? "all" : "mine"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1)
  const { data, error, loading } = useData(request, "Reviews", {
    mode,
    search,
    status,
    page,
    cycleId: cycleId || undefined,
    staffId,
  })
  return (
    <>
      <div className="ep-intro">
        <div>
          <h2>Your review workspace</h2>
          <p>
            Start with agreed goals, record progress and complete each review
            stage.
          </p>
        </div>
        <span className="ep-number">
          {data?.total ?? "—"}
          <small>matching reviews</small>
        </span>
      </div>
      <div className="ep-filters">
        <Select
          title="Workspace"
          value={mode}
          onChange={(x) => {
            setMode(x)
            setPage(1)
          }}
          options={[
            { value: "mine", label: "My reviews" },
            { value: "assigned", label: "Reviews assigned to me" },
            ...(admin ? [{ value: "all", label: "All school reviews" }] : []),
          ]}
        />
        <Select
          title="Status"
          required={false}
          value={status}
          onChange={(x) => {
            setStatus(x)
            setPage(1)
          }}
          options={[
            "Planning",
            "InProgress",
            "SelfSubmitted",
            "ManagerSubmitted",
            "Approved",
            "Acknowledged",
            "Disputed",
            "Closed",
            "Superseded",
            "Cancelled",
          ].map((x) => ({ value: x, label: label(x) }))}
        />
        <label className="ep-field">
          <span>Search</span>
          <input
            placeholder="Employee or review cycle"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </label>
      </div>
      {cycleId && (
        <p>
          Filtered to the selected cycle.{" "}
          <button
            onClick={() => {
              clearCycle()
              setPage(1)
            }}
          >
            Show all cycles
          </button>
        </p>
      )}
      <ErrorBox message={error} />
      {loading ? (
        <p>Loading reviews…</p>
      ) : (
        <div className="ep-scroll">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Cycle</th>
                <th>Reviewer</th>
                <th>Review due</th>
                <th>Status</th>
                <th>Approved score</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((r: Row) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.staffName}</strong>
                  </td>
                  <td>
                    {r.reviewPeriod}
                    <small>Revision {r.revision}</small>
                  </td>
                  <td>{r.reviewerName}</td>
                  <td>{r.reviewDue}</td>
                  <td>
                    <Badge value={r.status} />
                  </td>
                  <td>{r.scorePercent == null ? "—" : `${r.scorePercent}%`}</td>
                  <td>
                    <button onClick={() => open(r.id)}>Open review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && (
            <p className="ep-empty">
              No reviews match this view.
              {admin
                ? " Create a template and cycle to get started."
                : " Your assigned reviews will appear here."}
            </p>
          )}
        </div>
      )}
      <Pager data={data} page={page} setPage={setPage} />
    </>
  )
}
function Reports({ request }: { request: Request }) {
  const { data, error, loading } = useData(request, "Reports")
  const rows = data?.groups || []
  return (
    <>
      <div className="ep-row">
        <div>
          <h2>Cycle reporting</h2>
          <p>
            Complete school totals, grouped by cycle and template version.
            Averages use approved, current revisions only.
          </p>
        </div>
        <button
          disabled={!rows.length}
          onClick={() =>
            csv([
              [
                "Cycle",
                "Template version",
                "Reviews",
                "Approved",
                "Completed",
                "Overdue",
                "Disagreements",
                "Average score",
                "Development actions",
                "Development completed",
              ],
              ...rows.map((x: Row) => [
                x.name,
                x.templateVersion,
                x.total,
                x.approved,
                x.completed,
                x.overdue,
                x.disputed,
                x.averageScore,
                x.developmentActions,
                x.completedDevelopment,
              ]),
            ])
          }
        >
          Export CSV
        </button>
      </div>
      <ErrorBox message={error} />
      {loading ? (
        <p>Loading report…</p>
      ) : (
        <div className="ep-scroll">
          <table>
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Reviews</th>
                <th>Approved</th>
                <th>Completed</th>
                <th>Overdue</th>
                <th>Disagreements</th>
                <th>Average</th>
                <th>Development</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x: Row) => (
                <tr key={x.cycleId}>
                  <td>
                    <strong>{x.name}</strong>
                    <small>Template v{x.templateVersion}</small>
                  </td>
                  <td>{x.total}</td>
                  <td>{x.approved}</td>
                  <td>{x.completed}</td>
                  <td>{x.overdue}</td>
                  <td>{x.disputed}</td>
                  <td>
                    {x.averageScore == null
                      ? "Unscored"
                      : `${Number(x.averageScore).toFixed(2)}%`}
                  </td>
                  <td>
                    {x.completedDevelopment}/{x.developmentActions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="ep-empty">
              Reports appear when staff are assigned to a cycle.
            </p>
          )}
        </div>
      )}
      <p className="ep-muted">
        Use results alongside evidence and context. Different templates may
        measure different expectations.
      </p>
    </>
  )
}
function History({ request, staffId }: { request: Request; staffId?: string }) {
  const [page, setPage] = useState(1),
    { data, error, loading } = useData(request, "History", { page, staffId })
  return (
    <>
      <h2>Preserved reviews</h2>
      <p>
        Previous reviews retain their original five-point ratings and goals.
        They are read-only.
      </p>
      <ErrorBox message={error} />
      {loading ? (
        <p>Loading history…</p>
      ) : (
        data?.items.map((x: Row) => (
          <details className="ep-card" key={x.id}>
            <summary>
              <strong>
                {x.staffName} · {x.reviewPeriod}
              </strong>{" "}
              — {x.overallRating}/5 · {x.status}
            </summary>
            <p>Reviewer: {x.reviewerName}</p>
            <p>
              <strong>Strengths:</strong> {x.strengths || "—"}
            </p>
            <p>
              <strong>Areas for improvement:</strong>{" "}
              {x.areasForImprovement || "—"}
            </p>
            {x.goals.map((g: Row, i: number) => (
              <p key={i}>
                {g.title} · {g.status} · {g.dueDate || "No deadline"}
              </p>
            ))}
          </details>
        ))
      )}
      {!loading && !data?.items.length && (
        <p className="ep-empty">No legacy reviews are available.</p>
      )}
      <Pager data={data} page={page} setPage={setPage} />
    </>
  )
}
