import { Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function TeacherGradeEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mt-4 font-semibold text-gray-900">
          No Subject Selected
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Please select a session, term, class and subject to start entering
          grades
        </p>
      </CardContent>
    </Card>
  )
}
