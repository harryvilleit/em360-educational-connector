export type NotificationType =
  | "fee_reminder"
  | "announcement"
  | "event"
  | "result"
  | "consent"
  | "visitation"
  | "health"

export interface ParentNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  date: string
  read: boolean
  priority: "high" | "normal"
  term?: string
  session?: string
  metadata?: { amount?: string; dueDate?: string }
}

export function createMockNotifications(
  formatMoney: (amount: number) => string
): ParentNotification[] {
  const termFee = formatMoney(85_000)
  const lateSurcharge = formatMoney(5_000)
  const outstandingBalance = formatMoney(22_000)

  return [
    {
      id: "n1",
      type: "fee_reminder",
      title: "3rd Term School Fees Due — May 31",
      body: `This is a reminder that 3rd term school fees of ${termFee} are due by May 31, 2025. Kindly visit the bursary or make payment via the school's online portal. Late payment attracts a ${lateSurcharge} surcharge. Please contact the bursary for any payment plan enquiries.`,
      date: "2025-05-20",
      read: false,
      priority: "high",
      term: "3rd Term",
      session: "2024/2025",
      metadata: { amount: termFee, dueDate: "May 31, 2025" },
    },
    {
      id: "n2",
      type: "announcement",
      title: "End-of-Term PTA Meeting — May 9",
      body: "Dear Parents, you are warmly invited to our end-of-term PTA meeting on Friday, May 9, 2025 at 10:00am in the school hall. Agenda includes 3rd term fees, academic performance review, and school improvement projects. Attendance is compulsory for all parents and guardians.",
      date: "2025-05-02",
      read: false,
      priority: "high",
      term: "3rd Term",
      session: "2024/2025",
    },
    {
      id: "n3",
      type: "result",
      title: "2nd Term Results Now Available",
      body: "The 2nd term academic results for the 2024/2025 session have been published. You can view your child's result in the Result Records section of this portal. Please review their performance and speak with their class teacher if you have any concerns.",
      date: "2025-04-30",
      read: true,
      priority: "normal",
      term: "2nd Term",
      session: "2024/2025",
    },
    {
      id: "n5",
      type: "fee_reminder",
      title: "Outstanding 2nd Term Balance",
      body: `Our records indicate that you have an outstanding balance of ${outstandingBalance} from the 2nd term. Kindly clear this balance before May 9 to avoid disruption to your child's participation in end-of-term activities. Please visit the bursary for your statement.`,
      date: "2025-04-15",
      read: true,
      priority: "high",
      term: "2nd Term",
      session: "2024/2025",
      metadata: { amount: outstandingBalance, dueDate: "May 9, 2025" },
    },
    {
      id: "n6",
      type: "announcement",
      title: "3rd Term Resumption — May 19",
      body: "This is to inform all parents that school resumes for the 3rd term on Monday, May 19, 2025. Students are expected in full school uniform by 7:45am. No latecomers will be admitted on resumption day. Please make necessary arrangements.",
      date: "2025-04-28",
      read: true,
      priority: "normal",
      term: "3rd Term",
      session: "2024/2025",
    },
  ]
}
