import { Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function TeacherGradeNoAssessmentStructure() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mt-4 font-semibold text-gray-900">
          No Assessment Structure
        </h3>
        <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
          No assessment components have been configured for this session and term
          yet. Contact your administrator to set up the grading structure.
        </p>
      </CardContent>
    </Card>
  )
}
