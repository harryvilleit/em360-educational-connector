import type { SaveLmsLiveClassPayloadI } from "@/api/lmsLiveClass.api"
import type { ScheduleCourseLiveClassForm } from "@/pages/Dashboard/Lms/components/ScheduleCourseLiveClassModal"

function localIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function buildLiveClassPayload(
  form: ScheduleCourseLiveClassForm
): SaveLmsLiveClassPayloadI {
  const hasCourse = form.courseId !== "__no_course__"
  return {
    title: form.title.trim(),
    description: form.description,
    coverImageUrl: form.coverImageUrl || null,
    courseId: hasCourse ? form.courseId : null,
    scheduledStartUtc: localIso(form.scheduledDate, form.startTime),
    scheduledEndUtc: localIso(form.scheduledDate, form.endTime),
    targetEnrollmentFromUtc:
      hasCourse && form.targetEnrollmentFrom
        ? new Date(`${form.targetEnrollmentFrom}T00:00:00`).toISOString()
        : null,
    targetEnrollmentToUtc:
      hasCourse && form.targetEnrollmentTo
        ? new Date(`${form.targetEnrollmentTo}T23:59:59.999`).toISOString()
        : null,
    isPaid: true,
    price: Number(form.price),
    maxParticipants: Number(form.maxParticipants),
    invitedEmails: form.invitedEmails
      .split(/[\n,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  }
}
