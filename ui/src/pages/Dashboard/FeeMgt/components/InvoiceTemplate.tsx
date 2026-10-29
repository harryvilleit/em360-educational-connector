import type { SchoolInfo } from "@/data"
import type { StudentInvoiceI } from "@/api/feeManagement.api/types"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useInvoiceSignatureStore } from "@/store/invoiceSignature.store"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface Props {
  invoice: StudentInvoiceI
  school: SchoolInfo
}

export default function InvoicePDFTemplate({ invoice, school }: Props) {
  const schoolId = useSchoolId()
  const { currencyCode, formatMoney } = useSchoolMoney()
  const signature = useInvoiceSignatureStore((s) => s.getSignature(schoolId))

  const statusColor: Record<string, string> = {
    Paid: "#16a34a",
    Partial: "#d97706",
    Unpaid: "#dc2626",
  }
  const color = statusColor[invoice.paymentStatus] ?? "#6b7280"

  return (
    <div
      id="invoice-pdf-root"
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "13px",
        color: "#1a1a1a",
        background: "#fff",
        width: "794px",
        minHeight: "1123px",
        padding: "48px 56px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
        }}
      >
        {/* Logo left */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {school.logoUrl ? (
            <img
              src={school.logoUrl}
              alt="School Logo"
              style={{
                width: "64px",
                height: "64px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          ) : (
            // Initials fallback when no logo is set
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
                background: "#1d4ed8",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {school.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
        </div>

        {/* School name + contact right */}
        <div style={{ textAlign: "right", maxWidth: "340px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#1d4ed8",
              marginBottom: "4px",
            }}
          >
            {school.name}
          </div>
          <div style={{ color: "#555", lineHeight: "1.6", fontSize: "12px" }}>
            <div>{school.address}</div>
            <div>{school.phone}</div>
            <div>{school.email}</div>
            <div>{school.website}</div>
            <div>Reg: {school.registrationNumber}</div>
          </div>
        </div>
      </div>

      {/* ── DIVIDER ─────────────────────────────────────────────────────── */}
      <div style={{ borderTop: "2px solid #1d4ed8", marginBottom: "28px" }} />

      {/* ── INVOICE TITLE + META ────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#111",
            }}
          >
            INVOICE
          </div>
          <div style={{ color: "#888", fontSize: "13px", marginTop: "2px" }}>
            #{invoice.invoiceNumber}
          </div>
        </div>

        {/* Status badge */}
        <div
          style={{
            padding: "6px 16px",
            borderRadius: "999px",
            background: `${color}18`,
            color,
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.5px",
            border: `1px solid ${color}40`,
          }}
        >
          {invoice.paymentStatus.toUpperCase()}
        </div>
      </div>

      {/* ── META GRID: Invoice details + Billed To ─────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Invoice details */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "1px",
              color: "#888",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Invoice Details
          </div>
          {[
            ["Issue Date", invoice.issueDate],
            ["Due Date", invoice.dueDate],
            ["Term", invoice.term],
            ["Session", invoice.session],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: "#666" }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Billed To */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "1px",
              color: "#888",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Billed To
          </div>
          <div
            style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}
          >
            {invoice.parentName}
          </div>
          <div
            style={{
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}
            >
              Student
            </div>
            <div style={{ fontWeight: 600 }}>{invoice.studentName}</div>
            <div style={{ color: "#555", fontSize: "12px" }}>
              {invoice.class}
            </div>
          </div>
        </div>
      </div>

      {/* ── ITEMS TABLE ─────────────────────────────────────────────────── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
        }}
      >
        <thead>
          <tr style={{ background: "#1d4ed8", color: "#fff" }}>
            {[
              "Item Description",
              `Amount (${currencyCode})`,
              `Discount (${currencyCode})`,
              `Net (${currencyCode})`,
            ].map((col, i) => (
              <th
                key={col}
                style={{
                  padding: "10px 14px",
                  textAlign: i === 0 ? "left" : "right",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.3px",
                  borderRadius:
                    i === 0
                      ? "6px 0 0 6px"
                      : i === 3
                        ? "0 6px 6px 0"
                        : undefined,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr
              key={`${item.description}-${idx}`}
              style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}
            >
              <td
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {item.description}
              </td>
              <td
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {item.amount.toLocaleString()}
              </td>
              <td
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderBottom: "1px solid #f0f0f0",
                  color: item.discount > 0 ? "#dc2626" : "#999",
                }}
              >
                {item.discount > 0 ? `-${item.discount.toLocaleString()}` : "—"}
              </td>
              <td
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderBottom: "1px solid #f0f0f0",
                  fontWeight: 600,
                }}
              >
                {item.netAmount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── TOTALS ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "32px",
        }}
      >
        <div style={{ minWidth: "280px" }}>
          {[
            ["Subtotal", formatMoney(invoice.subTotal)],
            ["Total Discount", formatMoney(-invoice.totalDiscount)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid #f0f0f0",
                color: "#555",
              }}
            >
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          {/* Grand Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 16px",
              marginTop: "8px",
              background: "#1d4ed8",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            <span>Grand Total</span>
            <span>{formatMoney(invoice.grandTotal)}</span>
          </div>
          {/* Balance due */}
          {invoice.paymentStatus !== "Paid" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 16px",
                marginTop: "6px",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              <span>Balance Due</span>
              <span>{formatMoney(invoice.outstandingAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── NOTES ───────────────────────────────────────────────────────── */}
      {invoice.notes && (
        <div
          style={{
            background: "#eff6ff",
            borderLeft: "4px solid #1d4ed8",
            padding: "14px 18px",
            borderRadius: "0 8px 8px 0",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "12px",
              color: "#1d4ed8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "6px",
            }}
          >
            Notes
          </div>
          <div
            style={{
              color: "#374151",
              lineHeight: "1.6",
              whiteSpace: "pre-line",
            }}
          >
            {invoice.notes}
          </div>
        </div>
      )}

      {/* ── SIGNATURE LINE ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "48px",
          paddingTop: "24px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "160px",
              borderBottom: "1.5px solid #1a1a1a",
              marginBottom: "6px",
              paddingBottom: "2px",
              fontSize: "13px",
              fontWeight: 600,
              fontStyle: signature ? "italic" : "normal",
            }}
          >
            {signature?.name ?? ""}
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>
            {signature?.title || "Authorised Signature"}
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>{school.name}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "160px",
              borderBottom: "1.5px solid #1a1a1a",
              marginBottom: "6px",
              paddingBottom: "2px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {invoice.parentName}
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>Received By</div>
          <div style={{ fontSize: "11px", color: "#666" }}>
            Date: {invoice.issueDate}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "56px",
          right: "56px",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
          paddingTop: "12px",
        }}
      >
        <div style={{ fontSize: "11px", color: "#aaa" }}>
          {school.name} · {school.address} · {school.email}
        </div>
      </div>
    </div>
  )
}
