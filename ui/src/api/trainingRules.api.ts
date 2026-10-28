import apiClient from "./api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"
import type { TrainingStaff } from "./training.api"
export interface TrainingRuleSettings {
  revision: string
  name: string
  courseId: string
  audience: "allStaff" | "jobRoles" | "departments"
  targetIds: string[]
  includeExistingStaff: boolean
  deadlineDays: number
  enabled: boolean
}
export interface TrainingRule {
  id: string
  courseTitle: string
  settings: TrainingRuleSettings
  status: string
  lastMessage: string
  lastAssignedCount: number
  lastRemainingCount: number
  lastRunAtUtc: string | null
  nextRunAtUtc: string
}
export interface TrainingRuleOptions {
  courses: { id: string; name: string }[]
  jobRoles: { id: string; name: string }[]
  departments: { id: string; name: string }[]
}
export interface TrainingRulePreview {
  matchingStaff: number
  alreadyAssigned: number
  newAssignments: number
  sample: TrainingStaff[]
  message: string
}
interface Response<T> extends ApiResultI {
  value: T
}
const value = <T>(r: unknown) => normalizeResponse<Response<T>>(r).value
const cfg = (schoolId: string) => ({ params: { schoolId } })
const path = "/Training/Rules"
export const trainingRuleApi = {
  list: async (s: string) =>
    value<TrainingRule[]>(await apiClient.get(path, cfg(s))),
  options: async (s: string) =>
    value<TrainingRuleOptions>(await apiClient.get(`${path}/Options`, cfg(s))),
  preview: async (
    s: string,
    settings: TrainingRuleSettings,
    ruleId: string | null
  ) =>
    value<TrainingRulePreview>(
      await apiClient.post(`${path}/Preview`, { settings, ruleId }, cfg(s))
    ),
  save: async (s: string, settings: TrainingRuleSettings, id: string | null) =>
    value<TrainingRule>(
      await (id
        ? apiClient.put(`${path}/${encodeURIComponent(id)}`, settings, cfg(s))
        : apiClient.post(path, settings, cfg(s)))
    ),
  apply: async (s: string, rule: TrainingRule) =>
    value<{
      status: string
      newAssignments: number
      remainingStaff: number
      message: string
    }>(
      await apiClient.post(
        `${path}/${encodeURIComponent(rule.id)}/Apply`,
        { revision: rule.settings.revision },
        cfg(s)
      )
    ),
  remove: async (s: string, rule: TrainingRule) =>
    value<boolean>(
      await apiClient.delete(`${path}/${encodeURIComponent(rule.id)}`, {
        params: { schoolId: s, revision: rule.settings.revision },
      })
    ),
}
