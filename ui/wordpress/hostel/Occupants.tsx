import { usePermissions } from "@/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import { useRead, useSave, type Row } from "../rebuilt/service"
import { QueryState } from "../rebuilt/shared"
import { toast } from "sonner"
export default function Occupants({
  roomId,
  onAssign,
}: {
  roomId: string
  onAssign: () => void
}) {
  const query = useRead("/BedSpace/GetByRoom/" + roomId),
    save = useSave(),
    permissions = usePermissions()
  const beds: Row[] = Array.isArray(query.data)
    ? query.data
    : query.data?.items || []
  const occupied = beds.filter((b) => b.studentId)
  return (
    <section className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Room occupants</h2>
        {permissions.canUpdate("/dashboard/hostel/rooms") && (
          <Button onClick={onAssign}>Assign student</Button>
        )}
      </div>
      <QueryState query={query}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Student", "Admission number", "Bed", ""].map((x, i) => (
                  <th key={i} className="p-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {occupied.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">{b.studentName}</td>
                  <td className="p-3">{b.admissionNumber || "—"}</td>
                  <td className="p-3">{b.bedLabel}</td>
                  <td className="p-3">
                    {permissions.canUpdate("/dashboard/hostel/rooms") && (
                      <Button
                        variant="outline"
                        disabled={save.isPending}
                        onClick={async () => {
                          if (
                            !confirm(
                              "Check out this student and release their bed?"
                            )
                          )
                            return
                          try {
                            await save.mutateAsync({
                              path: "/WordPressHostel/ReleaseBed/" + b.id,
                            })
                          } catch (e) {
                            toast.error((e as Error).message)
                          }
                        }}
                      >
                        Check out
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!occupied.length && (
            <p className="py-5 text-slate-500">
              No students are assigned to this room.
            </p>
          )}
        </div>
      </QueryState>
    </section>
  )
}
