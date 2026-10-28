export interface ReportCardSignatory {
  id: string
  label: string
  name: string
}

export interface ReportCardConfig {
  title: string
  accentColor: string
  logoMode: "school" | "custom" | "none"
  customLogo: string
  showContact: boolean
  showAssessmentColumns: boolean
  showPosition: boolean
  showRemark: boolean
  remarkLabel: string
  defaultRemark: string
  signatories: ReportCardSignatory[]
  footerText: string
}

export const MAX_SIGNATORIES = 4

export const DEFAULT_REPORT_CARD_CONFIG: ReportCardConfig = {
  title: "Student Report Card",
  accentColor: "#1d4ed8",
  logoMode: "school",
  customLogo: "",
  showContact: true,
  showAssessmentColumns: true,
  showPosition: true,
  showRemark: true,
  remarkLabel: "Class teacher's remark",
  defaultRemark: "",
  signatories: [
    { id: "class-teacher", label: "Class teacher", name: "" },
    { id: "principal", label: "Principal", name: "" },
    { id: "parent", label: "Parent / Guardian", name: "" },
  ],
  footerText: "",
}
