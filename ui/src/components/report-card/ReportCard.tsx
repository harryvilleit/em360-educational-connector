import { useMemo, type CSSProperties } from "react"
import { DEFAULT_REPORT_CARD_CONFIG, type ReportCardConfig } from "./config"
import { reportCardStyles } from "./reportCardStyles"
import type { ReportCardData } from "./types"

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function ordinal(n: number) {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`
}

interface ReportCardProps {
  data: ReportCardData
  config?: ReportCardConfig
}

export default function ReportCard({
  data,
  config = DEFAULT_REPORT_CARD_CONFIG,
}: ReportCardProps) {
  const { school, student, subjects, summary, remark, issuedOn } = data

  // Columns are whatever assessments were recorded; exam-named ones go last
  const assessmentColumns = useMemo(() => {
    if (!config.showAssessmentColumns) return []
    const seen = new Set<string>()
    const exams: string[] = []
    const others: string[] = []
    for (const subject of subjects) {
      for (const { name } of subject.assessments) {
        if (seen.has(name)) continue
        seen.add(name)
        if (/exam/i.test(name)) exams.push(name)
        else others.push(name)
      }
    }
    return [...others, ...exams]
  }, [subjects, config.showAssessmentColumns])

  const logo =
    config.logoMode === "custom"
      ? config.customLogo
      : config.logoMode === "school"
        ? school.logo
        : undefined

  const contact = config.showContact
    ? [school.address, school.phone, school.email].filter(Boolean).join(" · ")
    : ""

  const position =
    summary.position > 0
      ? `${ordinal(summary.position)}${summary.totalStudents > 0 ? ` of ${summary.totalStudents}` : ""}`
      : "–"

  const remarkText = remark || config.defaultRemark

  const cardStyle = {
    "--rc-accent": config.accentColor,
    "--rc-stat-count": config.showPosition ? 3 : 2,
    "--rc-sign-count": Math.max(config.signatories.length, 1),
  } as CSSProperties

  return (
    <>
      <style>{reportCardStyles}</style>
      <article
        className="report-card"
        style={cardStyle}
        aria-label="Student report card"
      >
        <header className="rc-header">
          {logo && <img className="rc-logo" src={logo} alt="" />}
          <div className="rc-school">
            <h2 className="rc-school-name">{school.name}</h2>
            {contact && <p className="rc-school-contact">{contact}</p>}
          </div>
        </header>

        {config.title && <h3 className="rc-title">{config.title}</h3>}

        <section className="rc-info" aria-label="Student details">
          {[
            ["Student name", student.name],
            ["Admission no.", student.admissionNumber],
            ["Class", student.className],
            ["Session", student.session],
            ["Term", student.term],
            ["Date issued", issuedOn],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="rc-label">{label}</p>
              <p className="rc-value">{value || "—"}</p>
            </div>
          ))}
        </section>

        <table className="rc-table">
          <thead>
            <tr>
              <th scope="col">Subject</th>
              {assessmentColumns.map((name) => (
                <th key={name} scope="col">
                  {name}
                </th>
              ))}
              <th scope="col">Total</th>
              <th scope="col">Grade</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => {
              const scores = new Map(
                subject.assessments.map((a) => [a.name, a.score])
              )
              return (
                <tr key={subject.name}>
                  <td>{subject.name}</td>
                  {assessmentColumns.map((name) => {
                    const score = scores.get(name)
                    return (
                      <td key={name}>
                        {score === undefined ? "–" : formatScore(score)}
                      </td>
                    )
                  })}
                  <td className="rc-total">{formatScore(subject.total)}</td>
                  <td className="rc-total">{subject.grade || "–"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <section className="rc-summary" aria-label="Result summary">
          <div className="rc-stat">
            <p className="rc-label">Total score</p>
            <p className="rc-stat-value">{formatScore(summary.totalScore)}</p>
          </div>
          <div className="rc-stat">
            <p className="rc-label">Average</p>
            <p className="rc-stat-value">
              {formatScore(summary.averageScore)}%
            </p>
          </div>
          {config.showPosition && (
            <div className="rc-stat">
              <p className="rc-label">Position</p>
              <p className="rc-stat-value">{position}</p>
            </div>
          )}
        </section>

        {config.showRemark && (
          <section className="rc-remark" aria-label={config.remarkLabel}>
            <p className="rc-label">{config.remarkLabel}</p>
            <p className="rc-remark-text">{remarkText || "—"}</p>
          </section>
        )}

        {config.signatories.length > 0 && (
          <div className="rc-signatures">
            {config.signatories.map((signatory) => (
              <div key={signatory.id} className="rc-signature">
                {signatory.name && (
                  <span className="rc-signature-name">{signatory.name}</span>
                )}
                {signatory.label}
              </div>
            ))}
          </div>
        )}

        <footer className="rc-footer">
          {config.footerText || school.name}
        </footer>
      </article>
    </>
  )
}
