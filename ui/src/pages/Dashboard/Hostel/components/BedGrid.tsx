import { BedDouble, Loader2 } from "lucide-react"
import { useGetBedSpacesByRoom } from "@/hooks/hostel"
import { isBedSpaceOccupied } from "@/schema/bedSpace.schema"

interface BedGridProps {
  roomId: string
}

export function BedGrid({ roomId }: BedGridProps) {
  const { bedSpaces, isLoading } = useGetBedSpacesByRoom(roomId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="size-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (bedSpaces.length === 0) {
    return (
      <p className="text-sm text-gray-400">No bed spaces generated yet.</p>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {bedSpaces.map((bed) => {
        const occupied = isBedSpaceOccupied(bed.status)
        return (
          <div
            key={bed.id}
            className={`flex min-w-27.5 flex-col items-center rounded-xl border-2 p-3 text-center transition-all ${
              occupied
                ? "border-blue-300 bg-blue-50"
                : "border-dashed border-green-300 bg-green-50"
            }`}
          >
            <BedDouble
              className={`h-5 w-5 ${occupied ? "text-blue-500" : "text-green-500"}`}
            />
            <p className="mt-1 text-xs font-bold text-gray-700">
              {bed.bedLabel}
            </p>
            {occupied ? (
              <p className="mt-0.5 max-w-25 truncate text-[10px] text-blue-600">
                {bed.studentName}
              </p>
            ) : (
              <p className="mt-0.5 text-[10px] text-green-600">Available</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
