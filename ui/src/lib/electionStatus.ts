import { ElectionStatus } from "@/api/voting.api/types"

export function electionStatusLabel(
  status: ElectionStatus
): "Draft" | "Active" | "Closed" | "Cancelled" {
  // Backend may serialize the enum as a string ("Active") instead of a number
  switch (typeof status === "string" ? String(status).toLowerCase() : status) {
    case "active":
      return "Active"
    case "closed":
      return "Closed"
    case "cancelled":
      return "Cancelled"
    case "draft":
      return "Draft"
    case ElectionStatus.Active:
      return "Active"
    case ElectionStatus.Closed:
      return "Closed"
    case ElectionStatus.Cancelled:
      return "Cancelled"
    default:
      return "Draft"
  }
}
