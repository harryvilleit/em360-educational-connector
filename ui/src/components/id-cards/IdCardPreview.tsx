import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { idCardQrText, safeCardImage, type SchoolIdCard } from "@/lib/idCards"
import { idCardStyles } from "./cardStyles"

function CardImage({
  src,
  name,
  logo = false,
}: {
  src?: string
  name: string
  logo?: boolean
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const safe = safeCardImage(src)
  if (!safe || failedSource === safe)
    return logo ? null : (
      <div className="id-card-photo id-card-initials">
        {name
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")}
      </div>
    )
  return (
    <img
      src={safe}
      alt={logo ? "School logo" : name}
      className={logo ? "id-card-logo" : "id-card-photo"}
      onError={() => setFailedSource(safe)}
    />
  )
}

export default function IdCardPreview({ card }: { card: SchoolIdCard }) {
  const payload = idCardQrText(card)
  const [qr, setQr] = useState<{ payload: string; url: string } | null>(null)
  const [failedPayload, setFailedPayload] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 4,
      width: 500,
    })
      .then((url) => {
        if (!cancelled) setQr({ payload, url })
      })
      .catch(() => {
        if (!cancelled) setFailedPayload(payload)
      })
    return () => {
      cancelled = true
    }
  }, [payload])
  const qrUrl = qr?.payload === payload ? qr.url : undefined
  if (card.kind === "student")
    return (
      <div className="id-card-faces">
        <style>{idCardStyles}</style>
        <section>
          <p className="id-card-face-label">Front</p>
          <article
            className="school-id-card student-id-card"
            data-card-ready="true"
            aria-label={`${card.name} student ID front`}
          >
            <header className="id-card-header">
              <CardImage src={card.schoolLogo} name={card.schoolName} logo />
              <div>
                <div className="id-card-school">{card.schoolName}</div>
                <div className="student-id-kicker">
                  Student identification card
                </div>
              </div>
            </header>
            <div className="student-id-front-body">
              <CardImage src={card.photo} name={card.name} />
              <div className="student-id-details">
                <p className="id-card-label">Full name</p>
                <h2 className="id-card-name">{card.name}</h2>
                <p className="id-card-label">Student ID</p>
                <p className="id-card-value student-id-number">
                  {card.displayId}
                </p>
                <div className="student-id-meta">
                  <div>
                    <p className="id-card-label">Class</p>
                    <p className="id-card-value">
                      {card.className || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="id-card-label">Gender</p>
                    <p className="id-card-value">
                      {card.gender || "Not recorded"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <footer className="id-card-footer id-card-footer-split">
              <span className="id-card-footer-primary">
                Property of {card.schoolName}
              </span>
              {card.issuedOn && (
                <span className="id-card-footer-secondary">
                  Issued {card.issuedOn}
                </span>
              )}
            </footer>
          </article>
        </section>
        <section>
          <p className="id-card-face-label">Back</p>
          <article
            className="school-id-card student-id-card"
            data-card-ready={qrUrl ? "true" : "false"}
            aria-label={`${card.name} student ID back`}
          >
            <header className="student-id-back-header">
              {card.schoolName}
            </header>
            <div className="student-id-back-body">
              <div className="student-id-return">
                <h2>If found, please return to:</h2>
                <p className="student-id-office">The School Office</p>
                <p>{card.schoolName}</p>
                {card.schoolAddress && <p>{card.schoolAddress}</p>}
                {card.schoolPhone && (
                  <p>
                    <strong>Tel:</strong> {card.schoolPhone}
                  </p>
                )}
                {card.schoolEmail && (
                  <p>
                    <strong>Email:</strong> {card.schoolEmail}
                  </p>
                )}
                {!card.schoolPhone &&
                  !card.schoolEmail &&
                  !card.schoolAddress && (
                    <p>Please hand this card to the school reception.</p>
                  )}
              </div>
              <div>
                {qrUrl ? (
                  <img
                    className="id-card-qr"
                    src={qrUrl}
                    alt="QR code containing basic student identification details"
                  />
                ) : (
                  <p role="status" className="id-card-value">
                    {failedPayload === payload
                      ? "QR code unavailable. Reopen to retry."
                      : "Preparing QR code..."}
                  </p>
                )}
                <p className="id-card-scan">Scan for student details</p>
              </div>
            </div>
            <footer className="id-card-footer id-card-footer-split">
              <span className="id-card-footer-primary">
                Student ID: {card.displayId}
              </span>
              {card.session && (
                <span className="id-card-footer-secondary">
                  Session {card.session}
                </span>
              )}
            </footer>
          </article>
        </section>
      </div>
    )
  return (
    <>
      <style>{idCardStyles}</style>
      <article
        className="school-id-card"
        data-card-ready={qrUrl ? "true" : "false"}
        aria-label={`${card.name} ${card.kind} ID card`}
      >
        <header className="id-card-header">
          <CardImage src={card.schoolLogo} name={card.schoolName} logo />
          <div className="id-card-school">{card.schoolName}</div>
        </header>
        <div className="id-card-body">
          <CardImage src={card.photo} name={card.name} />
          <div>
            <h2 className="id-card-name">{card.name}</h2>
            <p className="id-card-label">Staff ID</p>
            <p className="id-card-value">{card.displayId}</p>
            <p className="id-card-label">Role</p>
            <p className="id-card-value">{card.role || "Staff"}</p>
            {card.kind === "staff" && card.department && (
              <>
                <p className="id-card-label">Department</p>
                <p className="id-card-value">{card.department}</p>
              </>
            )}
          </div>
          <div>
            {qrUrl ? (
              <img
                className="id-card-qr"
                src={qrUrl}
                alt="QR code containing basic identification details"
              />
            ) : (
              <p role="status" className="id-card-value">
                {failedPayload === payload
                  ? "QR code could not be generated. Reopen this card to retry."
                  : "Preparing QR code..."}
              </p>
            )}
            <p className="id-card-scan">Scan for basic details</p>
          </div>
        </div>
        <footer className="id-card-footer id-card-footer-split">
          <span className="id-card-footer-primary">
            Staff identification card
          </span>
          {card.issuedOn && (
            <span className="id-card-footer-secondary">
              Issued {card.issuedOn}
            </span>
          )}
        </footer>
      </article>
    </>
  )
}
