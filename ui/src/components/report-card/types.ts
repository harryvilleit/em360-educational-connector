export interface ReportCardData {
  school: {
    name: string
    logo?: string
    phone?: string
    email?: string
    address?: string
  }
  student: {
    name: string
    admissionNumber: string
    className: string
    session: string
    term: string
  }
  subjects: Array<{
    name: string
    assessments: Array<{ name: string; score: number }>
    total: number
    grade: string
  }>
  summary: {
    totalScore: number
    averageScore: number
    position: number
    totalStudents: number
  }
  remark?: string
  issuedOn: string
}
