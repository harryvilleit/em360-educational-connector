import { useState, type FormEvent } from "react"
import { FileText, HeartHandshake, MessageSquareText, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useAddLearnerSupportContribution,
  useMyLearnerSupport,
  useUploadLearnerSupportDocument,
} from "@/hooks/learnerSupport"
import type { LearnerSupportContributionType } from "@/api/learnerSupport.api"

function date(value?: string) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T00:00:00`))
}

export default function FamilySupportView({
  schoolId,
  studentId,
  actor,
}: {
  schoolId: string
  studentId: string
  actor: "learner" | "parent"
}) {
  const { support, isPending, isError } = useMyLearnerSupport(schoolId, studentId)
  const contribution = useAddLearnerSupportContribution()
  const document = useUploadLearnerSupportDocument()
  const [note, setNote] = useState("")

  if (isPending) return <p className="py-12 text-center text-sm text-muted-foreground">Loading support information…</p>
  if (isError) return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Support information could not be loaded.</p>
  if (!support) return <Card className="py-12"><CardContent className="text-center"><HeartHandshake className="mx-auto mb-3 size-8 text-blue-600" /><p className="font-semibold">No active support plan to show</p><p className="mt-1 text-sm text-muted-foreground">If you have a concern, contact the school or use the contribution area when a case is opened.</p></CardContent></Card>

  const plan = support.plans.find((value) => value.status === "Published")
  function addNote(event: FormEvent) {
    event.preventDefault()
    contribution.mutate({ schoolId, caseId: support!.id, contributorType: (actor === "learner" ? "Learner" : "ParentOrGuardian") as LearnerSupportContributionType, content: note, isSharedWithFamily: true }, { onSuccess: () => setNote("") })
  }
  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const file = data.get("file")
    if (!(file instanceof File) || !file.size) return
    document.mutate({ schoolId, caseId: support!.id, category: actor === "learner" ? "LearnerVoice" : "ParentContribution", title: String(data.get("title")), isVisibleToFamily: true, file }, { onSuccess: () => event.currentTarget.reset() })
  }

  return <div className="space-y-5">
    <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white"><div className="flex items-start gap-3"><HeartHandshake className="mt-1 size-6" /><div><h1 className="text-2xl font-bold">{actor === "learner" ? "My support" : "Support plan"}</h1><p className="mt-1 text-sm text-blue-100">A clear view of agreed support, adjustments and upcoming review dates.</p></div></div></div>
    <Tabs defaultValue="summary"><TabsList><TabsTrigger value="summary">Summary</TabsTrigger><TabsTrigger value="plan">Plan</TabsTrigger><TabsTrigger value="voice">My voice</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger></TabsList>
      <TabsContent value="summary" className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle>What helps</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><section><p className="font-medium">Support summary</p><p className="text-muted-foreground">{support.supportSummary || "Not added yet"}</p></section><section><p className="font-medium">Communication</p><p className="text-muted-foreground">{support.communicationPreferences || "Not added yet"}</p></section><section><p className="font-medium">Effective strategies</p><p className="text-muted-foreground">{support.effectiveStrategies || "Not added yet"}</p></section></CardContent></Card><Card><CardHeader><CardTitle>Reasonable adjustments</CardTitle></CardHeader><CardContent className="space-y-3">{!support.adjustments.length ? <p className="text-sm text-muted-foreground">No active adjustments are published.</p> : support.adjustments.map((value) => <div key={value.id} className="rounded-lg border p-3"><div className="flex gap-2"><ShieldCheck className="size-4 text-emerald-700" /><p className="font-medium">{value.title}</p></div><p className="mt-1 text-sm text-muted-foreground">{value.description}</p></div>)}</CardContent></Card></TabsContent>
      <TabsContent value="plan"><Card><CardHeader><CardTitle>{plan?.title || "Published plan"}</CardTitle></CardHeader><CardContent>{!plan ? <p className="text-sm text-muted-foreground">The support team has not published a plan yet.</p> : <div className="space-y-5 text-sm"><div className="grid gap-4 md:grid-cols-3"><section><p className="font-medium">Needs</p><p className="text-muted-foreground">{plan.needs}</p></section><section><p className="font-medium">Outcomes</p><p className="text-muted-foreground">{plan.outcomes}</p></section><section><p className="font-medium">Review date</p><p className="text-muted-foreground">{date(plan.reviewDate)}</p></section></div><div><p className="mb-2 font-medium">Agreed provision</p><div className="grid gap-3 md:grid-cols-2">{plan.provisions.map((value) => <div className="rounded-lg bg-gray-50 p-3" key={value.id}><p className="font-medium">{value.title}</p><p className="text-muted-foreground">{value.frequency} · {value.durationMinutes} minutes</p><p className="mt-1 text-muted-foreground">{value.description}</p></div>)}</div></div></div>}</CardContent></Card></TabsContent>
      <TabsContent value="voice" className="grid gap-4 lg:grid-cols-[1fr_1.2fr]"><Card><CardHeader><CardTitle><MessageSquareText className="mr-2 inline size-5" />Add your view</CardTitle></CardHeader><CardContent><form onSubmit={addNote} className="space-y-3"><textarea required className="min-h-32 w-full rounded-lg border p-3 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What is working, what is difficult, or what should change?" /><Button type="submit" variant="primary" disabled={contribution.isPending || !note.trim()}>Share with support team</Button></form></CardContent></Card><div className="space-y-3">{support.contributions.map((value) => <Card key={value.id}><CardContent><p>{value.content}</p><p className="mt-2 text-xs text-muted-foreground">{value.contributorName || value.contributorType} · {date(value.dateCreated)}</p></CardContent></Card>)}</div></TabsContent>
      <TabsContent value="documents" className="space-y-4"><Card><CardHeader><CardTitle>Share a document</CardTitle></CardHeader><CardContent><form onSubmit={upload} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input name="title" required className="h-10 rounded-lg border px-3 text-sm" placeholder="Document title" /><input name="file" type="file" required className="h-10 rounded-lg border px-3 py-2 text-sm" /><Button type="submit" variant="primary" disabled={document.isPending}>Upload</Button></form></CardContent></Card><div className="grid gap-3 md:grid-cols-2">{support.documents.map((value) => <a key={value.id} href={value.fileUrl} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border p-4 hover:bg-gray-50"><FileText className="size-5 text-blue-700" /><div><p className="font-medium">{value.title}</p><p className="text-xs text-muted-foreground">{value.fileName} · {date(value.dateCreated)}</p></div></a>)}</div></TabsContent>
    </Tabs>
  </div>
}
