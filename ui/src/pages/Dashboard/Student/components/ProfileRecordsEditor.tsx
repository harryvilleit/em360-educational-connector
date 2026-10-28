import type { StudentProfileData } from "@/api/studentPortal.api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ProfileRecordsEditor({
  value,
  onChange,
}: {
  value: StudentProfileData
  onChange: (value: StudentProfileData) => void
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-semibold">Academic History</h3>
        {value.academicHistory.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3"
          >
            {(["session", "term", "class", "remarks"] as const).map((field) => (
              <label className="text-sm" key={field}>
                {field}
                <Input
                  aria-label={`Academic ${field} ${index + 1}`}
                  value={row[field] || ""}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      academicHistory: value.academicHistory.map((r, i) =>
                        i === index ? { ...r, [field]: e.target.value } : r,
                      ),
                    })
                  }
                />
              </label>
            ))}
            <label className="text-sm">
              Average (%)
              <Input
                type="number"
                min="0"
                max="100"
                value={row.average ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    academicHistory: value.academicHistory.map((r, i) =>
                      i === index
                        ? {
                            ...r,
                            average:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          }
                        : r,
                    ),
                  })
                }
              />
            </label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...value,
                  academicHistory: value.academicHistory.filter(
                    (_, i) => i !== index,
                  ),
                })
              }
            >
              Remove academic record
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            onChange({
              ...value,
              academicHistory: [
                ...value.academicHistory,
                { session: "", term: "", class: "" },
              ],
            })
          }
        >
          Add academic record
        </Button>
      </section>
      <section className="space-y-3">
        <h3 className="font-semibold">Welfare Records</h3>
        {value.welfareRecords.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2"
          >
            {(
              [
                "type",
                "date",
                "description",
                "reportedBy",
                "resolution",
              ] as const
            ).map((field) => (
              <label className="text-sm" key={field}>
                {field}
                <Input
                  aria-label={`Welfare ${field} ${index + 1}`}
                  type={field === "date" ? "date" : "text"}
                  value={row[field] || ""}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      welfareRecords: value.welfareRecords.map((r, i) =>
                        i === index ? { ...r, [field]: e.target.value } : r,
                      ),
                    })
                  }
                />
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={row.resolved}
                onChange={(e) =>
                  onChange({
                    ...value,
                    welfareRecords: value.welfareRecords.map((r, i) =>
                      i === index ? { ...r, resolved: e.target.checked } : r,
                    ),
                  })
                }
              />
              Resolved
            </label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...value,
                  welfareRecords: value.welfareRecords.filter(
                    (_, i) => i !== index,
                  ),
                })
              }
            >
              Remove welfare record
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            onChange({
              ...value,
              welfareRecords: [
                ...value.welfareRecords,
                {
                  type: "Counseling",
                  date: new Date().toISOString().slice(0, 10),
                  description: "",
                  resolved: false,
                },
              ],
            })
          }
        >
          Add welfare record
        </Button>
      </section>
      <label className="block space-y-2 text-sm">
        Behavioral Notes
        <Textarea
          value={value.behavioralNotes ?? ""}
          onChange={(e) =>
            onChange({ ...value, behavioralNotes: e.target.value })
          }
        />
      </label>
      <label className="block space-y-2 text-sm">
        Extracurricular Activities (comma separated)
        <Input
          value={value.extracurriculars.join(", ")}
          onChange={(e) =>
            onChange({
              ...value,
              extracurriculars: e.target.value.split(",").map((x) => x.trim()),
            })
          }
        />
      </label>
    </div>
  )
}
