import { useSchoolCurrencyConfigured } from "@/contexts/SchoolContext"
import type { ReportData, ReportSource } from "../../useReportData"
import {
  NOT_CONNECTED,
  RESTRICTED_NOTE,
  SOURCE_LABEL,
} from "../../sourceStatus"

const list = (sources: ReportSource[]) =>
  sources.map((k) => SOURCE_LABEL[k]).join(", ")

/**
 * Explains every report source that returned no figures. The reports never
 * substitute sample numbers, so blank tiles always have a stated reason.
 */
export function DemoSourcesBanner({ data }: { data: ReportData }) {
  const currencyConfigured = useSchoolCurrencyConfigured()
  const missing = (Object.keys(data) as ReportSource[]).filter(
    (k) => data[k].state === "error"
  )
  // Money appears wherever fee figures do; never present a fallback as the school's currency.
  const currencyMissing = !currencyConfigured && data.fee.state !== "idle"
  const notice = currencyMissing && (
    <div
      role="status"
      className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800"
    >
      Your school&apos;s currency has not been set, so amounts are shown without
      a currency. A school administrator can set the base currency in Settings ›
      Billing &amp; Plan.
    </div>
  )
  if (missing.length === 0) return notice || null
  const notConnected = missing.filter((k) => NOT_CONNECTED.includes(k))
  const restricted = missing.filter(
    (k) => !NOT_CONNECTED.includes(k) && RESTRICTED_NOTE[k]
  )
  const failed = missing.filter(
    (k) => !NOT_CONNECTED.includes(k) && !RESTRICTED_NOTE[k]
  )

  return (
    <>
      {notice}
      <div
        role="status"
        className="mb-5 space-y-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-700"
      >
        <p>Some figures are left blank rather than estimated:</p>
        <ul className="list-disc space-y-0.5 pl-5">
          {restricted.map((k) => (
            <li key={k}>{RESTRICTED_NOTE[k]}</li>
          ))}
          {failed.length > 0 && (
            <li>
              {list(failed)} could not be loaded. You may not have access, or
              the request failed; try again later.
            </li>
          )}
          {notConnected.length > 0 && (
            <li>
              {list(notConnected)} {notConnected.length > 1 ? "are" : "is"} not
              connected to EM360 records yet, so there are no live figures.
            </li>
          )}
        </ul>
      </div>
    </>
  )
}
