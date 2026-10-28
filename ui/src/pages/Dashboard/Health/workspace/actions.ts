import {
  localNow,
  localTime,
  today,
  outcome,
  incidentStatus,
  roles,
  type Field,
  type FormSpec,
  type Request,
  type Row,
} from "./shared"
const f = (
  name: string,
  label: string,
  type = "text",
  required = false,
  value?: any,
  help?: string
): Field => ({ name, label, type, required, value, help })
const select = (
  name: string,
  label: string,
  labels: string[],
  value?: any
): Field => ({
  name,
  label,
  required: true,
  value,
  options: labels
    .map((label, value) => ({ label, value }))
    .filter((x) => x.label),
})
const utc = (v: string) => (v ? new Date(v).toISOString() : null)
const optional = (v: string) => v || null
export function healthActions(
  request: Request,
  schoolId: string,
  studentId: string,
  workspace: Row,
  staff: Row[],
  open: (s: FormSpec) => void
) {
  const base = `/HealthRecord/schools/${schoolId}`,
    student = `${base}/students/${studentId}`
  const post = (path: string, body: Row, method = "POST") =>
    request(path, method, { schoolId, ...body })
  const profile = () => {
    const p = workspace.profile ?? {}
    open({
      title: "Update health profile",
      fields: [
        ...["allergies", "chronicConditions", "disabilities"].map((k, i) =>
          f(
            k,
            ["Allergies", "Long-term conditions", "Disabilities"][i],
            "textarea",
            false,
            p[k]
          )
        ),
        f("bloodGroup", "Blood group", "text", false, p.bloodGroup),
        f("genotype", "Genotype (if relevant)", "text", false, p.genotype),
        f(
          "specialNeeds",
          "Additional support required",
          "checkbox",
          false,
          p.specialNeeds
        ),
        f(
          "specialNeedsDescription",
          "Support needs",
          "textarea",
          false,
          p.specialNeedsDescription
        ),
        f(
          "emergencyContactName",
          "Emergency contact name",
          "text",
          false,
          p.emergencyContactName
        ),
        f(
          "emergencyContactPhone",
          "Emergency telephone",
          "tel",
          false,
          p.emergencyContactPhone
        ),
        f(
          "emergencyContactRelationship",
          "Relationship",
          "text",
          false,
          p.emergencyContactRelationship
        ),
        f(
          "emergencyInstructions",
          "Emergency instructions",
          "textarea",
          false,
          p.emergencyInstructions
        ),
        f(
          "requiresEmergencyMedication",
          "Emergency medication required",
          "checkbox",
          false,
          p.requiresEmergencyMedication
        ),
        {
          ...f("changeReason", "Reason for update", "textarea", true),
          minLength: 10,
        },
      ],
      submit: (v) =>
        post("/HealthRecord/StudentRecords/Upsert", {
          studentSchoolId: studentId,
          ...v,
        }),
    })
  }
  const visit = () =>
    open({
      title: "Log sick-bay visit",
      description:
        "Parent contact is recorded separately after saving. No notification is assumed.",
      fields: [
        f("complaint", "Reason for visit", "textarea", true),
        f("treatment", "Action or support provided", "textarea", true),
        f("attendedBy", "Attended by", "text", true),
        f("visitDate", "Visit time", "datetime-local", true, localNow()),
        select("status", "Outcome", ["Admitted", "Discharged", "Referred"], 0),
        f("additionalNotes", "Additional notes", "textarea"),
      ],
      submit: (v) =>
        post("/HealthRecord/SickBay/Log", {
          ...v,
          studentSchoolId: studentId,
          status: Number(v.status),
          visitDate: utc(v.visitDate),
          isParentNotified: false,
        }),
    })
  const discharge = (row: Row) =>
    open({
      title: "Complete sick-bay visit",
      fields: [
        select("status", "Outcome", ["", "Discharged", "Referred"], 1),
        f("dischargeTime", "Time", "datetime-local", true, localNow()),
        {
          ...f("notes", "Outcome / referral details", "textarea", true),
          minLength: 10,
        },
      ],
      submit: (v) =>
        post(
          `/HealthRecord/SickBay/Update/${row.id}`,
          {
            ...row,
            status: Number(v.status),
            dischargeTime: utc(v.dischargeTime),
            correctionReason: v.notes,
            additionalNotes: [row.additionalNotes, v.notes]
              .filter(Boolean)
              .join("\n"),
          },
          "PUT"
        ),
    })
  const voidVisit = (row: Row) =>
    open({
      title: "Void visit recorded in error",
      description:
        "The visit and its history are retained. This does not delete the record.",
      fields: [{ ...f("reason", "Reason", "textarea", true), minLength: 10 }],
      submit: (v) =>
        post(`/HealthRecord/SickBay/${row.id}/void`, { reason: v.reason }),
    })
  const carePlan = () => {
    const p = workspace.carePlans?.[0] ?? {}
    open({
      title: "New care plan version",
      description:
        "Saving an active plan supersedes the previous active version. Previous versions remain available.",
      fields: [
        f("title", "Plan title", "text", true, p.title),
        select("status", "Status", ["", "Draft", "Active"], 1),
        f("healthSummary", "Health summary", "textarea", true, p.healthSummary),
        f(
          "emergencyInstructions",
          "Emergency instructions",
          "textarea",
          true,
          p.emergencyInstructions
        ),
        f("dailySupport", "Daily support", "textarea", false, p.dailySupport),
        f(
          "activitiesAndTripsInstructions",
          "Activities and trips",
          "textarea",
          false,
          p.activitiesAndTripsInstructions
        ),
        f("effectiveFrom", "Effective from", "date", true, today()),
        f("reviewDate", "Review date", "date", true, p.reviewDate),
        f(
          "parentAgreedAtUtc",
          "Parent agreement recorded at",
          "datetime-local"
        ),
      ],
      submit: (v) =>
        post(`${student}/care-plans`, {
          ...v,
          status: Number(v.status),
          parentAgreedAtUtc: utc(v.parentAgreedAtUtc),
        }),
    })
  }
  const consent = () =>
    open({
      title: "Record consent",
      description:
        "Record the guardian’s actual decision and evidence. A new version supersedes the previous decision for this consent type.",
      fields: [
        select(
          "type",
          "Consent type",
          [
            "",
            "Emergency treatment",
            "Medication administration",
            "Information sharing",
            "Health screening",
            "Off-site care",
            "Other",
          ],
          2
        ),
        select(
          "status",
          "Decision",
          ["", "Pending", "Granted", "Declined", "Withdrawn", "Expired"],
          1
        ),
        f("scope", "Scope of consent", "textarea", true),
        f("guardianName", "Guardian name", "text", true),
        f(
          "evidenceMethod",
          "Evidence method / reference",
          "text",
          true,
          undefined,
          "For example: signed form reference or recorded telephone agreement."
        ),
        f("respondedAtUtc", "Actual response time", "datetime-local"),
        f("validFrom", "Valid from", "date", true, today()),
        f("validUntil", "Valid until", "date"),
        f("notes", "Notes", "textarea"),
      ],
      submit: (v) =>
        post(`${student}/consents`, {
          ...v,
          type: Number(v.type),
          status: Number(v.status),
          respondedAtUtc: utc(v.respondedAtUtc),
          validUntil: optional(v.validUntil),
        }),
    })
  const medication = () => {
    const all = (workspace.consents ?? []).filter((x: Row) => x.type === 2)
    const max = Math.max(0, ...all.map((x: Row) => x.version))
    const valid = all.filter(
      (x: Row) =>
        x.version === max &&
        x.status === 2 &&
        x.validFrom <= today() &&
        (!x.validUntil || x.validUntil >= today())
    )
    if (!valid.length)
      throw Error(
        "Record current, granted medication consent in the Consent tab first."
      )
    open({
      title: "Authorise medication",
      fields: [
        {
          name: "healthConsentId",
          label: "Current medication consent",
          required: true,
          options: valid.map((x: Row) => ({
            value: x.id,
            label: `${x.guardianName} · ${x.scope}`,
          })),
        },
        f("medicationName", "Medication", "text", true),
        f("form", "Form"),
        f("strength", "Strength"),
        f("dose", "Authorised dose", "text", true),
        f("route", "Route", "text", true),
        f("frequency", "Frequency", "text", true),
        f("instructions", "Administration instructions", "textarea", true),
        f("reason", "Reason", "textarea"),
        f("storageInstructions", "Storage instructions"),
        f("startDate", "Start date", "date", true, today()),
        f("endDate", "End date", "date"),
        f("isEmergencyMedication", "Emergency medication", "checkbox"),
      ],
      submit: (v) =>
        post(`${student}/medications`, {
          ...v,
          status: 2,
          endDate: optional(v.endDate),
        }),
    })
  }
  const medicationStatus = (row: Row) =>
    open({
      title: "Change medication status",
      fields: [
        {
          name: "status",
          label: "Status",
          required: true,
          options: [
            { value: 2, label: "Resume" },
            { value: 3, label: "Suspend" },
            { value: 5, label: "Revoke permanently" },
          ],
        },
        {
          ...f("reason", "Reason", "textarea", true),
          minLength: 10,
          maxLength: 1000,
        },
      ],
      submit: (v) =>
        post(
          `${base}/medications/${row.id}/status`,
          {
            ...v,
            status: Number(v.status),
            expectedVersion: row.workflowVersion,
          },
          "PUT"
        ),
    })
  const administration = (row: Row) => {
    const requestId = crypto.randomUUID()
    open({
      title: `Record administration · ${row.medicationName}`,
      description: `Authorised: ${row.dose} · ${row.route} · ${row.frequency}. ${row.instructions}`,
      fields: [
        f(
          "administeredAtUtc",
          "Administration / outcome time",
          "datetime-local",
          true,
          localNow()
        ),
        select("outcome", "Outcome", outcome, 1),
        f(
          "doseGiven",
          "Dose given",
          "text",
          false,
          undefined,
          "Required for Given or Self-administered."
        ),
        f("notes", "Notes", "textarea"),
      ],
      submit: (v) =>
        post(`${base}/medications/${row.id}/administrations`, {
          ...v,
          requestId,
          outcome: Number(v.outcome),
          administeredAtUtc: utc(v.administeredAtUtc),
        }),
    })
  }
  const correction = (entry: Row) => {
    const row = entry.original,
      current = entry.corrections?.[0]?.values ?? row,
      requestId = crypto.randomUUID()
    open({
      title: "Append an administration correction",
      description:
        "The original entry stays unchanged. Both the correction and its author are retained.",
      fields: [
        f(
          "administeredAtUtc",
          "Correct administration time",
          "datetime-local",
          true,
          localTime(current.administeredAtUtc)
        ),
        select("outcome", "Correct outcome", outcome, current.outcome),
        f("doseGiven", "Correct dose", "text", false, current.doseGiven),
        f("notes", "Corrected notes", "textarea", false, current.notes),
        {
          ...f("reason", "Why is this correction needed?", "textarea", true),
          minLength: 10,
          maxLength: 1000,
        },
      ],
      submit: (v) =>
        post(`${base}/administrations/${row.id}/corrections`, {
          ...v,
          requestId,
          expectedRevision: entry.corrections?.[0]?.version ?? 0,
          outcome: Number(v.outcome),
          administeredAtUtc: utc(v.administeredAtUtc),
        }),
    })
  }
  const incident = () =>
    open({
      title: "Record health incident",
      fields: [
        select(
          "type",
          "Type",
          [
            "",
            "Illness",
            "Injury",
            "Allergic reaction",
            "Medication error",
            "Mental wellbeing",
            "Other",
          ],
          1
        ),
        select(
          "severity",
          "Severity",
          ["", "Low", "Moderate", "High", "Critical"],
          2
        ),
        f("occurredAtUtc", "Occurred at", "datetime-local", true, localNow()),
        f("location", "Location"),
        f("description", "What happened?", "textarea", true),
        f(
          "firstAidOrActionTaken",
          "First aid or action taken",
          "textarea",
          true
        ),
        f(
          "emergencyServicesContacted",
          "Emergency services contacted",
          "checkbox"
        ),
        f("outcomeOrFollowUp", "Initial outcome / follow-up", "textarea"),
      ],
      submit: (v) =>
        post(`${student}/incidents`, {
          ...v,
          type: Number(v.type),
          severity: Number(v.severity),
          status: 1,
          occurredAtUtc: utc(v.occurredAtUtc),
          parentNotified: false,
        }),
    })
  const followUp = (row: Row) =>
    open({
      title: "Incident follow-up",
      fields: [
        select("status", "Status", incidentStatus, row.status),
        {
          name: "assignedToUserId",
          label: "Responsible staff member",
          value: row.assignedToUserId,
          options: [
            { value: "", label: "Unassigned" },
            ...staff.map((x) => ({ value: x.id, label: x.name })),
          ],
        },
        f(
          "followUpAtUtc",
          "Next follow-up",
          "datetime-local",
          false,
          localTime(row.followUpAtUtc),
          "Required for Monitoring or Referred."
        ),
        {
          ...f("notes", "Progress / reason for change", "textarea", true),
          minLength: 10,
          maxLength: 1000,
        },
        f(
          "closureNotes",
          "Closure notes",
          "textarea",
          false,
          undefined,
          "Required when closing. Reopening requires a new progress note."
        ),
      ],
      submit: (v) =>
        post(
          `${base}/incidents/${row.id}/workflow`,
          {
            ...v,
            status: Number(v.status),
            assignedToUserId: optional(v.assignedToUserId),
            followUpAtUtc: utc(v.followUpAtUtc),
            closureNotes: optional(v.closureNotes),
            expectedVersion: row.workflowVersion,
          },
          "PUT"
        ),
    })
  const contact = async (
    row: Row,
    entityType: string,
    targetStudent = studentId
  ) => {
    const guardians: Row[] = await request(
      `${base}/students/${targetStudent}/guardians`
    )
    if (!guardians.length)
      throw Error(
        "Link a guardian to this student before recording parent contact."
      )
    const requestId = crypto.randomUUID()
    open({
      title: "Parent contact",
      description:
        "Portal sends a private inbox notification. Phone, email and in-person options record contact you have already made; they do not send messages.",
      fields: [
        {
          name: "guardianId",
          label: "Linked guardian",
          required: true,
          options: guardians.map((x) => ({
            value: x.id,
            label: `${x.name}${x.phone ? " · " + x.phone : ""}${x.hasPortal ? " · Portal account" : ""}`,
          })),
        },
        {
          name: "method",
          label: "Contact method",
          required: true,
          value: "Phone",
          options: [
            { value: "Phone", label: "Phone call completed" },
            { value: "InPerson", label: "Spoke in person" },
            { value: "Email", label: "Email already sent" },
            { value: "Portal", label: "Send parent portal notification" },
          ],
        },
        f(
          "contactedAtUtc",
          "Actual contact time",
          "datetime-local",
          false,
          localNow(),
          "Required for manual contact; portal sending uses the server time."
        ),
        f("notes", "Contact notes (staff only)", "textarea"),
      ],
      label: "Record contact / send portal notification",
      submit: (v) =>
        post(`${base}/students/${targetStudent}/contacts`, {
          ...v,
          requestId,
          entityId: row.id,
          entityType,
          contactedAtUtc: v.method === "Portal" ? null : utc(v.contactedAtUtc),
        }),
    })
  }
  const grant = (row?: Row) =>
    open({
      title: row ? "Update health access" : "Grant health access",
      description:
        "School administration and clinical access are separate. Records administrators cannot record medication doses.",
      fields: [
        {
          name: "userId",
          label: "Staff member",
          required: true,
          value: row?.userId,
          options: staff.map((x) => ({ value: x.id, label: x.name })),
        },
        select("role", "Health role", roles, row?.role ?? 5),
        f(
          "isActive",
          "Access active",
          "checkbox",
          false,
          row?.isActive ?? true
        ),
        f(
          "expiresAtUtc",
          "Expires at (optional)",
          "datetime-local",
          false,
          localTime(row?.expiresAtUtc)
        ),
        {
          ...f("reason", "Reason", "textarea", true),
          minLength: 10,
          maxLength: 1000,
        },
      ],
      submit: (v) =>
        post(`${base}/access-grants`, {
          ...v,
          role: Number(v.role),
          expiresAtUtc: utc(v.expiresAtUtc),
        }),
    })
  const emergency = () =>
    open({
      title: "Temporary emergency access",
      description:
        "Access is limited to this student for 30 minutes. The reason and every access are audited, and an alert is recorded for access managers.",
      fields: [
        {
          ...f("reason", "Emergency reason", "textarea", true),
          minLength: 20,
          maxLength: 1000,
        },
      ],
      label: "Activate emergency access",
      submit: (v) => post(`${student}/emergency-access`, v),
    })
  return {
    profile,
    visit,
    discharge,
    voidVisit,
    carePlan,
    consent,
    medication,
    medicationStatus,
    administration,
    correction,
    incident,
    followUp,
    contact,
    grant,
    emergency,
  }
}
