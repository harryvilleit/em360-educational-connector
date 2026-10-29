import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  AlertCircle,
  BedDouble,
  DoorOpen,
  Loader2,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetHostelRoomById } from "@/hooks/hostel"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { StatusBadge } from "@/pages/Dashboard/Hostel/components/StatusBadge"
import { StatCard } from "@/components/general/StatCard"
import { InfoItem } from "@/pages/Dashboard/Hostel/components/InfoItem"
import { BedGrid } from "@/pages/Dashboard/Hostel/components/BedGrid"
import Occupants from "./Occupants"
import AssignmentModal from "@/pages/Dashboard/Hostel/components/AssignmentModal"
import { hostelTypeLabel, hostelTypeToGender } from "@/schema/hostelType.schema"

export default function RoomDetailPage() {
  const navigate = useNavigate()
  const { roomId, productId } = useParams<{
    roomId: string
    productId: string
  }>()
  const p = productId ?? ""

  const { room, isLoading } = useGetHostelRoomById(roomId ?? "")

  const [assignOpen, setAssignOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="p-6">
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">Room not found.</p>
        </div>
      </div>
    )
  }

  const isBoys = hostelTypeToGender(room.hostelType) === "male"
  const available = room.totalBeds - room.occupiedBeds
  const occupancyPct =
    room.totalBeds > 0
      ? Math.round((room.occupiedBeds / room.totalBeds) * 100)
      : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Room {room.roomNumber}
            {room.roomName && (
              <span className="ml-2 text-lg font-normal text-gray-400">
                — {room.roomName}
              </span>
            )}
          </>
        }
        description={
          <span className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isBoys
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              {hostelTypeLabel(room.hostelType)}
            </span>
            <span>{room.hostelName}</span>
            {room.floor && (
              <>
                <span className="text-gray-300">·</span>
                <span>{room.floor}</span>
              </>
            )}
          </span>
        }
        onBack={() => navigate(DashboardRoutes.toHostelRooms(p))}
        backLabel="Back to Rooms"
        actions={
          available > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAssignOpen(true)}
            >
              <Plus className="size-3.5" />
              Assign Student
            </Button>
          )
        }
      />

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Beds"
          value={room.totalBeds}
          icon={BedDouble}
          color="blue"
        />
        <StatCard
          label="Occupied"
          value={room.occupiedBeds}
          icon={Users}
          color="purple"
          valueColor="text-purple-600"
        />
        <StatCard
          label="Available"
          value={available}
          icon={BedDouble}
          color="green"
          valueColor="text-green-600"
        />
        {/* Occupancy card — needs a progress bar so stays inline */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Occupancy</p>
            <div className="rounded-lg bg-gray-50 p-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p
            className={`mt-1 text-2xl font-bold ${
              occupancyPct >= 100
                ? "text-red-600"
                : occupancyPct >= 80
                  ? "text-orange-600"
                  : "text-green-600"
            }`}
          >
            {occupancyPct}%
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${
                occupancyPct >= 100
                  ? "bg-red-500"
                  : occupancyPct >= 80
                    ? "bg-orange-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(occupancyPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Room Details ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Room Details
        </h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <InfoItem label="Type">
            <StatusBadge variant="info">
              {hostelTypeLabel(room.hostelType)}
            </StatusBadge>
          </InfoItem>
          {room.floor && <InfoItem label="Floor">{room.floor}</InfoItem>}
          <InfoItem label="Status">
            <StatusBadge
              variant={
                room.totalBeds === 0
                  ? "neutral"
                  : available === 0
                    ? "danger"
                    : available <= 1
                      ? "warning"
                      : "success"
              }
              dot
            >
              {room.totalBeds === 0
                ? "No beds set up"
                : available === 0
                  ? "Full"
                  : available <= 1
                    ? "Almost Full"
                    : "Available"}
            </StatusBadge>
          </InfoItem>
          {room.description && (
            <InfoItem label="Notes" className="w-full">
              {room.description}
            </InfoItem>
          )}
          {room.amenities && room.amenities.length > 0 && (
            <InfoItem label="Amenities" className="w-full">
              <div className="mt-1 flex flex-wrap gap-1.5">
                {room.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </InfoItem>
          )}
        </div>
      </div>

      {/* ── Bed Spaces ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Bed Spaces</h2>
        <BedGrid roomId={room.id} />
      </div>

      <Occupants roomId={room.id} onAssign={() => setAssignOpen(true)} />

      <AssignmentModal
        hostelId={room.hostelId}
        gender={hostelTypeToGender(room.hostelType)}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        preselectedRoomId={room.id}
      />
    </div>
  )
}
