import type { VideoStorageOverview } from "@/api/videoStorage.api"
import { Button } from "@/components/ui/button"

export default function SchoolVideoStorageNotice({ storage, isLoading, disabledReason, onRefresh }: {
  storage?: VideoStorageOverview
  isLoading: boolean
  disabledReason: string
  onRefresh: () => void
}) {
  return <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm" aria-live="polite">
    <div className="flex items-center justify-between gap-3">
      <p className="font-semibold text-blue-950">School video storage</p>
      <Button type="button" variant="outline" size="sm" disabled={isLoading} onClick={onRefresh}>Refresh storage</Button>
    </div>
    {isLoading ? <p className="mt-1 text-blue-900">Checking available minutes…</p> : <>
      {storage && <p className="mt-1 text-blue-900">{storage.availableMinutes.toLocaleString(undefined, { maximumFractionDigits: 2 })} minutes available of {storage.capacityMinutes.toLocaleString()} active paid and complimentary minutes.</p>}
      {disabledReason && <p className="mt-1 text-blue-900">{disabledReason}</p>}
    </>}
    <p className="mt-2 text-blue-900">YouTube links are free and remain available without paid video storage.</p>
    <p className="mt-1 text-xs text-blue-800">Cloudflare uploads must fit the available minutes. Existing uploads reserve storage until they finish or expire.</p>
  </div>
}
