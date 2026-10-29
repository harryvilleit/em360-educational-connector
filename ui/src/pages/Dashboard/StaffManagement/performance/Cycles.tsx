import { useState } from "react"
import {
  Badge,
  Check,
  ErrorBox,
  Modal,
  Note,
  Pager,
  PersonPicker,
  SaveForm,
  Select,
  TextField,
  today,
  useData,
  type Request,
  type Row,
} from "./shared"
export function Cycles({
  request,
  openReviews,
}: {
  request: Request
  openReviews: (id: string) => void
}) {
  const [page, setPage] = useState(1),
    [tick, setTick] = useState(0),
    [create, setCreate] = useState(false),
    [act, setAct] = useState<Row | null>(null),
    [note, setNote] = useState("")
  const { data, error, loading } = useData(request, "Cycles", { page }, tick)
  return (
    <>
      <div className="ep-row">
        <p>Agree expectations, review evidence and record development.</p>
        <button className="ep-primary" onClick={() => setCreate(true)}>
          New review cycle
        </button>
      </div>
      <ErrorBox message={error} />
      {loading ? (
        <p>Loading cycles…</p>
      ) : (
        <div className="ep-cards">
          {data?.items.map((x: Row) => (
            <article className="ep-card" key={x.id}>
              <div className="ep-row">
                <h3>{x.name}</h3>
                <Badge value={x.status} />
              </div>
              <p>
                {x.startsOn} — {x.endsOn} · {x.country} · {x.timeZone}
              </p>
              <dl className="ep-dates">
                <dt>Goals agreed</dt>
                <dd>{x.goalsDue}</dd>
                <dt>Self-assessment</dt>
                <dd>{x.selfDue}</dd>
                <dt>Review / approval</dt>
                <dd>{x.reviewDue}</dd>
              </dl>
              <div className="ep-actions">
                <button onClick={() => openReviews(x.id)}>View reviews</button>
                {(x.status === "Draft"
                  ? ["Launch", "Cancel"]
                  : x.status === "Active"
                    ? ["Close"]
                    : x.status === "Closed"
                      ? ["Reopen"]
                      : []
                ).map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setNote("")
                      setAct({ ...x, action: a })
                    }}
                  >
                    {a} cycle
                  </button>
                ))}
              </div>
            </article>
          ))}
          {!data?.items.length && (
            <p>
              No review cycles yet. Create a template, then assign your first
              cycle.
            </p>
          )}
        </div>
      )}
      <Pager data={data} page={page} setPage={setPage} />
      {create && (
        <Modal title="Create review cycle" close={() => setCreate(false)}>
          <CycleForm
            request={request}
            done={() => {
              setCreate(false)
              setTick(tick + 1)
            }}
          />
        </Modal>
      )}
      {act && (
        <Modal title={`${act.action} ${act.name}`} close={() => setAct(null)}>
          <SaveForm
            text={`${act.action} cycle`}
            save={async () => {
              await request(`Cycles/${act.id}/${act.action}`, "POST", {
                version: act.version,
                note,
              })
              setAct(null)
              setTick(tick + 1)
            }}
          >
            <p>
              {act.action === "Launch"
                ? "This starts the agreed-goals and assessment workflow for all assigned staff."
                : act.action === "Close"
                  ? "All reviews must be acknowledged or disagreements resolved before closing."
                  : act.action === "Reopen"
                    ? "Reopening allows authorised follow-up and corrected review revisions. Existing approved assessments remain preserved."
                    : "This cancels the draft cycle and its review assignments."}
            </p>
            <Note
              title="Reason / note"
              required
              value={note}
              onChange={setNote}
            />
          </SaveForm>
        </Modal>
      )}
    </>
  )
}
function CycleForm({ request, done }: { request: Request; done: () => void }) {
  const [v, setV] = useState<Row>({
      templateId: "",
      name: "",
      country: "",
      language: "en",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      startsOn: today(),
      endsOn: "",
      goalsDue: "",
      selfDue: "",
      reviewDue: "",
      requireSelfAssessment: true,
      allowReviewerApproval: false,
      participants: [],
    }),
    [templatePage, setTemplatePage] = useState(1),
    [templateSearch, setTemplateSearch] = useState(""),
    [selectedTemplate, setSelectedTemplate] = useState<Row | null>(null),
    [roles, setRoles] = useState<Row>({})
  const { data, error } = useData(request, "Templates", {
    page: templatePage,
    search: templateSearch,
  })
  const set = (k: string, x: any) => setV({ ...v, [k]: x })
  return (
    <SaveForm
      text="Create draft cycle"
      save={async () => {
        if (!v.participants.length) throw Error("Add at least one employee")
        await request("Cycles", "POST", {
          ...v,
          participants: v.participants.map((p: Row) => ({
            staffId: p.staffId,
            reviewerUserId: p.reviewer.userId,
            approverUserId: p.approver.userId,
            disputeHandlerUserId: p.dispute.userId,
          })),
        })
        done()
      }}
    >
      <div className="ep-grid">
        <TextField
          title="Cycle name"
          value={v.name}
          onChange={(x) => set("name", x)}
        />
        <TextField
          title="Country code (e.g. GB or NG)"
          value={v.country}
          maxLength={2}
          pattern="[A-Za-z]{2}"
          onChange={(x) => set("country", x.toUpperCase())}
        />
        <TextField
          title="Language code"
          value={v.language}
          maxLength={20}
          onChange={(x) => set("language", x)}
        />
        <TextField
          title="Time zone"
          value={v.timeZone}
          onChange={(x) => set("timeZone", x)}
        />
      </div>
      <TextField
        title="Search templates"
        value={templateSearch}
        required={false}
        onChange={(x) => {
          setTemplateSearch(x)
          setTemplatePage(1)
        }}
      />
      <ErrorBox message={error} />
      <Select
        title="Template"
        value={v.templateId}
        onChange={(x) => {
          set("templateId", x)
          setSelectedTemplate(data.items.find((t: Row) => t.id === x))
        }}
        options={[
          ...(selectedTemplate &&
          !(data?.items || []).some((x: Row) => x.id === selectedTemplate.id)
            ? [selectedTemplate]
            : []),
          ...(data?.items || []),
        ]
          .filter((x: Row) => x.active)
          .map((x: Row) => ({
            value: x.id,
            label: `${x.name} · ${x.roleLabel} · v${x.version}`,
          }))}
      />
      <Pager data={data} page={templatePage} setPage={setTemplatePage} />
      <div className="ep-grid">
        {["startsOn", "goalsDue", "selfDue", "reviewDue", "endsOn"].map(
          (k, i) => (
            <TextField
              key={k}
              title={
                [
                  "Cycle start",
                  "Agree goals by",
                  "Self-assessment due",
                  "Review and approval due",
                  "Cycle end",
                ][i]
              }
              type="date"
              value={v[k]}
              onChange={(x) => set(k, x)}
            />
          )
        )}
      </div>
      <Check
        title="Require employee self-assessment before manager submission"
        value={v.requireSelfAssessment}
        onChange={(x) => set("requireSelfAssessment", x)}
      />
      <Check
        title="Allow the same person to review and approve (small-school exception)"
        value={v.allowReviewerApproval}
        onChange={(x) => set("allowReviewerApproval", x)}
      />
      <h3>Review assignments</h3>
      <p>
        Choose reviewers, then add employees. Change the selections to assign a
        different team. Employees cannot review or approve themselves.
      </p>
      <div className="ep-grid">
        {["reviewer", "approver", "dispute"].map((k, i) => (
          <PersonPicker
            key={k}
            request={request}
            title={["Reviewer", "Approver", "Disagreement handler"][i]}
            value={roles[k]}
            onChange={(x) => setRoles({ ...roles, [k]: x })}
          />
        ))}
      </div>
      {roles.reviewer && roles.approver && roles.dispute && (
        <PersonPicker
          request={request}
          title="Add employee"
          staff
          value={null}
          onChange={(p) => {
            if (!v.participants.some((x: Row) => x.staffId === p.staffId))
              set("participants", [...v.participants, { ...p, ...roles }])
          }}
        />
      )}
      <div className="ep-scroll">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reviewer</th>
              <th>Approver</th>
              <th>Disagreement handler</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {v.participants.map((p: Row) => (
              <tr key={p.staffId}>
                <td>{p.name}</td>
                <td>{p.reviewer.name}</td>
                <td>{p.approver.name}</td>
                <td>{p.dispute.name}</td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "participants",
                        v.participants.filter(
                          (x: Row) => x.staffId !== p.staffId
                        )
                      )
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {v.participants.length} staff assigned. The cycle starts as a draft;
        launch it after checking assignments and dates.
      </p>
    </SaveForm>
  )
}
