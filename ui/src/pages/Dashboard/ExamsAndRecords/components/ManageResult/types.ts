export interface ClassResult {
  id: string
  classId: string
  className: string
  term: string
  session: string
  totalStudents: number
  resultsCollected: number
  status: "draft" | "submitted" | "approved" | "published"
  publishedDate?: string
  comments?: string
}

export interface SubjectAssessmentScore {
  name: string
  score: number
}

export interface StudentResultDetail {
  studentId: string
  studentName: string
  admissionNumber: string
  className: string
  sessionName: string
  termName: string
  position: number
  totalStudents: number
  subjects: Array<{
    name: string
    assessments: SubjectAssessmentScore[]
    caScore: number
    examScore: number
    total: number
    grade: string
  }>
  totalScore: number
  averageGrade: number
  remark?: string
  isPublished: boolean
  status: string
  datePublished: string | null
}

export interface CommentData {
  studentId: string
  studentName: string
  remark: string
  addedBy: string
  timestamp: string
}
