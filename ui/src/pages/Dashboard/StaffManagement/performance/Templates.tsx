import { useState } from "react"
import {
  Check,
  ErrorBox,
  Field,
  Modal,
  Note,
  Pager,
  SaveForm,
  Select,
  TextField,
  useData,
  type Request,
  type Row,
} from "./shared"
const criterion = (n: number): Row => ({
  key: `criterion_${n}`,
  section: "Professional practice",
  label: "",
  kind: "Rating",
  weight: 0,
  required: true,
  allowNotAssessed: true,
  minimum: 0,
  maximum: 100,
  lowerIsBetter: false,
  options: [],
})
const starter = (): Row => ({
  id: null,
  version: 0,
  name: "",
  roleLabel: "",
  active: true,
  definition: {
    scored: false,
    instructions:
      "Use specific examples, discuss progress and agree practical support.",
    policyReference: "",
    scale: [
      {
        key: "developing",
        label: "Developing",
        description:
          "Support and practice are needed to meet agreed expectations.",
        score: 25,
      },
      {
        key: "meeting",
        label: "Meeting expectations",
        description:
          "Consistently meets the agreed expectations for this role.",
        score: 75,
      },
      {
        key: "exceeding",
        label: "Exceeding expectations",
        description:
          "Consistently demonstrates evidence beyond agreed expectations.",
        score: 100,
      },
    ],
    criteria: [
      { ...criterion(1), label: "Role responsibilities", weight: 60 },
      {
        ...criterion(2),
        label: "Collaboration and professional practice",
        weight: 40,
      },
      {
        ...criterion(3),
        label: "Achievements, context and support",
        kind: "Text",
        section: "Reflection",
      },
    ],
  },
})
export function Templates({ request }: { request: Request }) {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [tick, setTick] = useState(0),
    [edit, setEdit] = useState<Row | null>(null)
  const { data, error, loading } = useData(
    request,
    "Templates",
    { page, search },
    tick
  )
  return (
    <>
      <div className="ep-row">
        <p>Create role-specific templates. Each cycle keeps its own version.</p>
        <button className="ep-primary" onClick={() => setEdit(starter())}>
          New template
        </button>
      </div>
      <input
        aria-label="Search templates"
        placeholder="Search templates or roles"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />
      <ErrorBox message={error} />
      {loading ? (
        <p>Loading templates…</p>
      ) : (
        <div className="ep-cards">
          {data?.items.map((x: Row) => (
            <article className="ep-card" key={x.id}>
              <span className="ep-eyebrow">
                {x.roleLabel} · VERSION {x.version}
              </span>
              <h3>{x.name}</h3>
              <p>
                {x.definition.criteria.length} criteria ·{" "}
                {x.definition.scored ? "Weighted score" : "Feedback only"} ·{" "}
                {x.active ? "Active" : "Archived"}
              </p>
              <button onClick={() => setEdit(structuredClone(x))}>
                Edit template
              </button>
            </article>
          ))}
          {!data?.items.length && (
            <p>
              No templates yet. Start with a role and customize its
              expectations.
            </p>
          )}
        </div>
      )}
      <Pager data={data} page={page} setPage={setPage} />
      {edit && (
        <Modal
          title={edit.id ? "Edit template" : "New performance template"}
          close={() => setEdit(null)}
        >
          <TemplateForm
            initial={edit}
            save={async (body) => {
              await request("Templates", "POST", body)
              setEdit(null)
              setTick(tick + 1)
            }}
          />
        </Modal>
      )}
    </>
  )
}
function TemplateForm({
  initial,
  save,
}: {
  initial: Row
  save: (b: Row) => Promise<void>
}) {
  const [v, setV] = useState(initial),
    d = v.definition
  const set = (k: string, x: any) => setV({ ...v, [k]: x }),
    def = (k: string, x: any) => set("definition", { ...d, [k]: x })
  const change = (index: number, k: string, value: any) =>
    def(
      "criteria",
      d.criteria.map((c: Row, i: number) =>
        i === index ? { ...c, [k]: value } : c
      )
    )
  return (
    <SaveForm save={() => save(v)}>
      <div className="ep-grid">
        <TextField
          title="Template name"
          value={v.name}
          onChange={(x) => set("name", x)}
          maxLength={150}
        />
        <TextField
          title="Role / staff group"
          value={v.roleLabel}
          onChange={(x) => set("roleLabel", x)}
          maxLength={150}
        />
      </div>
      <Check
        title="Available for new cycles"
        value={v.active}
        onChange={(x) => set("active", x)}
      />
      <Check
        title="Calculate a weighted score"
        value={d.scored}
        onChange={(x) => def("scored", x)}
      />
      <Note
        title="Instructions"
        value={d.instructions}
        onChange={(x) => def("instructions", x)}
      />
      <Note
        title="School policy / local framework reference"
        value={d.policyReference}
        onChange={(x) => def("policyReference", x)}
      />
      <h3>Rating scale</h3>
      <p>Explain each rating. Scores map to 0–100 when scoring is enabled.</p>
      {d.scale.map((s: Row, i: number) => (
        <div className="ep-card" key={i}>
          <div className="ep-grid">
            <TextField
              title="Stable key"
              value={s.key}
              onChange={(x) =>
                def(
                  "scale",
                  d.scale.map((r: Row, j: number) =>
                    j === i ? { ...r, key: x } : r
                  )
                )
              }
            />
            <TextField
              title="Label"
              value={s.label}
              onChange={(x) =>
                def(
                  "scale",
                  d.scale.map((r: Row, j: number) =>
                    j === i ? { ...r, label: x } : r
                  )
                )
              }
            />
            <TextField
              title="Score (0–100)"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={s.score}
              onChange={(x) =>
                def(
                  "scale",
                  d.scale.map((r: Row, j: number) =>
                    j === i ? { ...r, score: Number(x) } : r
                  )
                )
              }
            />
          </div>
          <Note
            title="Meaning / evidence expected"
            value={s.description}
            required
            onChange={(x) =>
              def(
                "scale",
                d.scale.map((r: Row, j: number) =>
                  j === i ? { ...r, description: x } : r
                )
              )
            }
          />
          <button
            type="button"
            disabled={d.scale.length <= 1}
            onClick={() =>
              def(
                "scale",
                d.scale.filter((_: Row, j: number) => j !== i)
              )
            }
          >
            Remove rating
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={d.scale.length >= 10}
        onClick={() =>
          def("scale", [
            ...d.scale,
            {
              key: `rating_${Date.now().toString(36)}`,
              label: "",
              description: "",
              score: 0,
            },
          ])
        }
      >
        Add rating
      </button>
      <h3>Criteria and sections</h3>
      <p>
        Current total:{" "}
        <strong>
          {d.criteria.reduce(
            (sum: number, c: Row) => sum + Number(c.weight),
            0
          )}
          %
        </strong>
        {d.scored ? " — must total 100%" : " — scores will not be calculated"}
      </p>
      {d.criteria.map((c: Row, i: number) => (
        <article className="ep-card" key={i}>
          <div className="ep-row">
            <h4>Criterion {i + 1}</h4>
            <div className="ep-actions">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const a = [...d.criteria]
                  ;[a[i - 1], a[i]] = [a[i], a[i - 1]]
                  def("criteria", a)
                }}
              >
                Move up
              </button>
              <button
                type="button"
                disabled={d.criteria.length === 1}
                onClick={() =>
                  def(
                    "criteria",
                    d.criteria.filter((_: Row, j: number) => i !== j)
                  )
                }
              >
                Remove
              </button>
            </div>
          </div>
          <div className="ep-grid">
            <TextField
              title="Stable key"
              value={c.key}
              onChange={(x) => change(i, "key", x)}
            />
            <TextField
              title="Section"
              value={c.section}
              onChange={(x) => change(i, "section", x)}
            />
            <TextField
              title="Criterion / question"
              value={c.label}
              onChange={(x) => change(i, "label", x)}
            />
            <Select
              title="Answer type"
              value={c.kind}
              options={[
                "Rating",
                "Number",
                "Percentage",
                "Text",
                "Checklist",
                "Evidence",
              ].map((x) => ({ value: x, label: x }))}
              onChange={(x) => {
                const next: Row = { ...c, kind: x }
                if (["Text", "Evidence"].includes(x)) next.weight = 0
                if (x === "Percentage") {
                  next.minimum = 0
                  next.maximum = 100
                }
                def(
                  "criteria",
                  d.criteria.map((r: Row, j: number) => (j === i ? next : r))
                )
              }}
            />
            <TextField
              title="Weight (%)"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={c.weight}
              disabled={["Text", "Evidence"].includes(c.kind)}
              onChange={(x) => change(i, "weight", Number(x))}
            />
          </div>
          <Check
            title="Required"
            value={c.required}
            onChange={(x) => change(i, "required", x)}
          />
          <Check
            title="Allow not assessed, with a reason"
            value={c.allowNotAssessed}
            onChange={(x) => change(i, "allowNotAssessed", x)}
          />
          {["Number", "Percentage"].includes(c.kind) && (
            <>
              <div className="ep-grid">
                <TextField
                  title="Minimum"
                  type="number"
                  step="any"
                  value={c.minimum}
                  disabled={c.kind === "Percentage"}
                  onChange={(x) => change(i, "minimum", Number(x))}
                />
                <TextField
                  title="Maximum"
                  type="number"
                  step="any"
                  value={c.maximum}
                  disabled={c.kind === "Percentage"}
                  onChange={(x) => change(i, "maximum", Number(x))}
                />
              </div>
              <Check
                title="A lower value represents better performance"
                value={c.lowerIsBetter}
                onChange={(x) => change(i, "lowerIsBetter", x)}
              />
            </>
          )}
          {c.kind === "Checklist" && (
            <Field title="Checklist options — one per line">
              <textarea
                value={c.options.join("\n")}
                onChange={(e) =>
                  change(i, "options", e.target.value.split("\n"))
                }
              />
            </Field>
          )}
        </article>
      ))}
      <button
        type="button"
        disabled={d.criteria.length >= 80}
        onClick={() => def("criteria", [...d.criteria, criterion(Date.now())])}
      >
        Add criterion
      </button>
      <p className="ep-muted">
        Changes apply only to new cycles. Existing reviews retain their original
        template.
      </p>
    </SaveForm>
  )
}
