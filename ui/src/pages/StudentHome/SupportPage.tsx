import FamilySupportView from "@/components/learnerSupport/FamilySupportView"
import { StudentGate } from "./StudentGate"

export default function StudentSupportPage() {
  return <StudentGate>{({ schoolId, studentId }) => <FamilySupportView schoolId={schoolId} studentId={studentId} actor="learner" />}</StudentGate>
}
