import { useSearchParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { TIMETABLE_TYPE } from "./timetable.utils"
import { TimetableManageTab } from "./components/TimetableManageTab"


const TAB_TO_TYPE: Record<string, number> = {
  class: TIMETABLE_TYPE.Class,
  assessment: TIMETABLE_TYPE.Assessment,
  exam: TIMETABLE_TYPE.Assessment,
  test: TIMETABLE_TYPE.Assessment,
}

export default function TimetableManagePage() {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const initialTypeFilter = tabParam ? TAB_TO_TYPE[tabParam] : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Timetables"
        description="Create, edit, and manage your timetables for classes, exams, and tests."
      />

      <TimetableManageTab initialTypeFilter={initialTypeFilter} />
    </div>
  )
}
