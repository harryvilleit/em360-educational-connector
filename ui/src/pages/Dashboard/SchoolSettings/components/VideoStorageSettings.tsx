import { openExternalPage } from "@/lib/portal-navigation"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Film, HardDrive, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { getVideoStorage, refreshVideoStorage, quoteVideoStorage, purchaseVideoStorage, resumeVideoStorage, manageVideoStorage, cancelVideoStorage, getStorageVideos, deleteStorageVideo, type VideoStorageQuote, type StorageVideo } from "@/api/videoStorage.api"
import { toSafeExternalUrl } from "@/lib/safeExternalUrl"
import SettingsCard from "./SettingsCard"

const minutes = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 })
const usd = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }).format(n)
const date = (v: string | null) => v ? new Date(v).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"

export default function VideoStorageSettings() {
  const schoolId = useSchoolId()
  const client = useQueryClient()
  const key = ["school-video-storage", schoolId]
  const query = useQuery({ queryKey: key, queryFn: () => getVideoStorage(schoolId), enabled: !!schoolId })
  const data = query.data
  const [addBlocks, setAddBlocks] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [quote, setQuote] = useState<VideoStorageQuote | null>(null)
  const [videosOpen, setVideosOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<StorageVideo | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const videoQuery = useQuery({ queryKey: ["school-storage-videos", schoolId, page], queryFn: () => getStorageVideos(schoolId, page), enabled: videosOpen && !!data?.canManage })

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("")
    try { await action() }
    catch (e) { setError(e instanceof Error ? e.message : "The storage request failed.") }
    finally { setBusy(false) }
  }
  async function refresh() {
    const updated = await refreshVideoStorage(schoolId)
    client.setQueryData(key, updated)
    await client.invalidateQueries({ queryKey: ["school-storage-videos", schoolId] })
  }
  async function navigateToPayment(result: { url: string | null }) {
    if (result.url) {
      const safe = toSafeExternalUrl(result.url)
      if (!safe) throw new Error("Invalid payment link. Please contact EM360 support.")
      openExternalPage(safe)
    } else {
      await refresh()
      setNotice("Storage payment status refreshed. Your capacity updates after payment is confirmed.")
    }
  }
  const startingNew = !data?.hasPaidSubscription
  const existingBlocks = startingNew ? 0 : data.subscribedMinutes / 500
  const validBlocks = Number.isInteger(addBlocks) && addBlocks > 0 && addBlocks + existingBlocks <= 2000
  const targetBlocks = existingBlocks + addBlocks
  const percent = data?.capacityMinutes ? Math.min(100, (data.usedMinutes + data.reservedMinutes) / data.capacityMinutes * 100) : 0

  return <SettingsCard title="Video storage" description="Monthly space for your school's Cloudflare videos, measured in minutes.">
    {query.isPending ? <p className="text-sm text-gray-500">Loading video storage…</p> : query.isError ?
      <div role="alert"><p className="text-sm text-red-700">Video storage could not be loaded.</p><Button variant="outline" onClick={() => void query.refetch()}>Try again</Button></div> : data &&
      <div className="space-y-6">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-white p-3 text-blue-600"><Film className="size-6" /></span><div>
              <p className="text-2xl font-bold">{minutes(data.capacityMinutes)} <span className="text-base font-medium text-gray-600">minutes</span></p>
              <p className="text-sm text-gray-600">{usd(data.monthlyTotal)} USD / month{data.cancelAtPeriodEnd ? " · Renewal cancelled" : ""}</p>
            </div></div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium capitalize">{!data.hasPaidSubscription && data.freeCapacityMinutes > 0 ? "Complimentary storage" : data.status === "none" ? "No storage plan" : data.status.replaceAll("_", " ")}</span>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-blue-100" role="progressbar" aria-label="Video storage used and reserved" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-gray-500">Used</dt><dd className="mt-1 font-semibold">{minutes(data.usedMinutes)} min</dd></div>
            <div><dt className="text-gray-500">Uploads in progress</dt><dd className="mt-1 font-semibold">{minutes(data.reservedMinutes)} min</dd></div>
            <div><dt className="text-gray-500">Available</dt><dd className="mt-1 font-semibold text-blue-700">{minutes(data.availableMinutes)} min</dd></div>
          </dl>
          <p className="mt-4 text-sm text-gray-600">Active paid: {minutes(data.paidCapacityMinutes)} min · Complimentary: {minutes(data.freeCapacityMinutes)} min{data.freeCapacityMinutes > 0 ? (data.freeExpiresAtUtc ? `, expires ${date(data.freeExpiresAtUtc)}` : ", no expiry") : ""}.</p>
          {data.paidThroughUtc && <p className="mt-4 text-xs text-gray-600">Paid through {date(data.paidThroughUtc)}. {data.cancelAtPeriodEnd ? "After this date, uploads require sufficient active complimentary capacity." : "Your stored videos continue to occupy space after renewal."}</p>}
        </div>
        {data.unverifiedVideos > 0 && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Measuring {data.unverifiedVideos} existing video(s). Uploads remain paused until their duration is confirmed.</p>}
        {data.availableMinutes <= 0 && <p className="text-sm text-gray-600">New videos cannot be uploaded until active paid or complimentary storage is available. Existing videos are kept.</p>}
        <p className="text-sm leading-6 text-gray-600">Buy space in blocks of 500 minutes: <strong>{usd(4)} USD/month</strong> for 500 minutes, <strong>{usd(8)} USD/month</strong> for 1,000 minutes. Deleting a video frees space; renewal does not reset usage.</p>
        {data.canManage ? <>
          {data.hasPendingPayment ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium">Storage payment in progress{data.pendingMinutes ? ` · target ${minutes(data.pendingMinutes)} minutes` : ""}</p>
            <p className="mt-1 text-sm text-gray-600">Resume this payment or refresh its status before buying more.</p>
            <Button className="mt-3" disabled={busy} onClick={() => void run(async () => navigateToPayment(await resumeVideoStorage(schoolId)))}>Resume payment</Button>
          </div> : !data.cancelAtPeriodEnd && <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Plus className="size-4" /> {existingBlocks ? "Add more storage" : "Buy video storage"}</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {[1, 2].map(n => <button key={n} type="button" aria-pressed={addBlocks === n} onClick={() => { setAddBlocks(n); setQuote(null) }} className={`rounded-xl border px-5 py-3 text-left ${addBlocks === n ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
                <span className="block text-sm font-semibold">{existingBlocks ? "+" : ""}{n * 500} minutes</span><span className="text-xs text-gray-600">{existingBlocks ? "+" : ""}{usd(n * 4)} USD/month</span>
              </button>)}
              <label className="grid gap-1 text-sm"><span>500-minute blocks</span><input aria-label="Number of storage blocks" type="number" min={1} max={2000} step={1} value={addBlocks} className="w-36 rounded-lg border p-2" onChange={e => { setAddBlocks(Number(e.target.value)); setQuote(null) }} /></label>
            </div>
            {validBlocks && <p className="mt-4 text-sm">New paid total: <strong>{minutes(targetBlocks * 500)} minutes · {usd(targetBlocks * 4)} USD/month</strong>.</p>}
            <p className="mt-2 text-xs leading-5 text-gray-500">Additional space is prorated to your existing renewal date. Preview the charge before confirming. Payment is collected in USD.</p>
            <Button className="mt-4" disabled={busy || !validBlocks} onClick={() => void run(async () => setQuote(await quoteVideoStorage(schoolId, targetBlocks)))}>{busy ? "Please wait…" : "Preview storage payment"}</Button>
          </div>}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy} onClick={() => void run(refresh)}><RefreshCw className="mr-2 size-4" />Refresh status</Button>
            <Button variant="outline" onClick={() => setVideosOpen(true)}><HardDrive className="mr-2 size-4" />Manage videos</Button>
            {data.hasPaidSubscription && <Button variant="outline" disabled={busy} onClick={() => void run(async () => navigateToPayment(await manageVideoStorage(schoolId)))}>Manage payment</Button>}
            {data.hasPaidSubscription && !data.cancelAtPeriodEnd && !data.hasPendingPayment && <Button variant="ghost" disabled={busy} onClick={() => setCancelling(true)}>Cancel renewal</Button>}
          </div>
        </> : <p className="text-sm text-gray-500">Ask the school owner to buy or manage video storage.</p>}
      </div>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-4 text-sm text-blue-700">{notice}</p>}
    <AlertDialog open={!!quote} onOpenChange={open => !open && setQuote(null)}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm video storage payment</AlertDialogTitle><AlertDialogDescription>
        Pay {usd(quote?.amountDue ?? 0)} USD now for a paid capacity of {minutes((quote?.targetBlocks ?? 0) * 500)} minutes. Your recurring total will be {usd(quote?.monthlyTotal ?? 0)} USD per month{quote?.renewalAtUtc ? `, renewing on ${date(quote.renewalAtUtc)}` : ""}. For an existing subscription, confirming may charge your saved card immediately. Extra capacity is available only after payment succeeds.
      </AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Go back</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={() => { const selected = quote; setQuote(null); if (selected) void run(async () => navigateToPayment(await purchaseVideoStorage(schoolId, selected))) }}>Confirm payment</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={cancelling} onOpenChange={setCancelling}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancel monthly storage renewal?</AlertDialogTitle><AlertDialogDescription>Paid capacity remains available until {date(data?.paidThroughUtc ?? null)}. After that date, uploads require sufficient active complimentary capacity. This does not delete your existing videos or cancel your school subscription.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep renewal</AlertDialogCancel><AlertDialogAction onClick={() => void run(async () => { await cancelVideoStorage(schoolId); await refresh() })}>Cancel renewal</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={videosOpen} onOpenChange={setVideosOpen}><DialogContent className="max-h-[90dvh] w-full overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>School video storage</DialogTitle><DialogDescription>Unused videos can be deleted to free space. Remove a video from its lesson before deleting it here.</DialogDescription></DialogHeader>
      {videoQuery.isPending ? <p>Loading videos…</p> : videoQuery.isError ? <p role="alert">Videos could not be loaded.</p> : <>
        {videoQuery.data?.items.length === 0 && <p className="py-8 text-center text-gray-500">No stored videos.</p>}
        <ul className="divide-y">{videoQuery.data?.items.map(v => <li key={v.id} className="flex items-center gap-3 py-4"><Film className="size-5 shrink-0 text-blue-600" /><div className="min-w-0 flex-1"><p className="break-all font-medium">{v.fileName}</p><p className="text-xs text-gray-500">{v.usedSeconds != null ? `${minutes(v.usedSeconds / 60)} min used` : v.reservedSeconds ? `${minutes(v.reservedSeconds / 60)} min reserved` : "Measuring duration"} · {v.attached ? "Used in a lesson" : "Unused"}{v.deleteRequested ? " · Deletion pending" : ""}</p></div><Button size="icon" variant="outline" aria-label={`Delete ${v.fileName}`} disabled={v.attached || busy} onClick={() => setDeleting(v)}><Trash2 className="size-4" /></Button></li>)}</ul>
        {(videoQuery.data?.totalPages ?? 0) > 1 && <div className="flex items-center justify-center gap-3"><Button variant="outline" disabled={page <= 1 || videoQuery.isFetching} onClick={() => setPage(p => p - 1)}>Previous</Button><span>Page {page} of {videoQuery.data?.totalPages}</span><Button variant="outline" disabled={page >= (videoQuery.data?.totalPages ?? 1) || videoQuery.isFetching} onClick={() => setPage(p => p + 1)}>Next</Button></div>}
      </>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
    </DialogContent></Dialog>
    <AlertDialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this unused video?</AlertDialogTitle><AlertDialogDescription>{deleting?.fileName} will be removed from Cloudflare. Its storage is freed only after deletion succeeds. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep video</AlertDialogCancel><AlertDialogAction onClick={() => { const selected = deleting; setDeleting(null); if (selected) void run(async () => { await deleteStorageVideo(schoolId, selected.id); await refresh() }) }}>Delete video</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </SettingsCard>
}
