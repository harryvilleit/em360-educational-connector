import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GradeStats {
  pending: number
  approved: number
  rejected: number
}

export default function GradeStatsCards({ stats }: { stats: GradeStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Pending Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.pending}
          </div>
          <p className="mt-1 text-xs text-gray-500">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Approved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.approved}
          </div>
          <p className="mt-1 text-xs text-gray-500">Ready to publish</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Rejected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <p className="mt-1 text-xs text-gray-500">Sent back to teacher</p>
        </CardContent>
      </Card>
    </div>
  )
}
