//  Performance Types

import type { Staff } from "."

export type ReviewStatus = "draft" | "submitted" | "acknowledged"

export type GoalStatus = "not-started" | "in-progress" | "completed"

export interface PerformanceRatings {
  jobKnowledge: number
  workQuality: number
  punctuality: number
  teamwork: number
  communication: number
}

//  Core Entities

export interface PerformanceGoal {
  id: string
  title: string
  status: GoalStatus
  dueDate?: string
}

export interface PerformanceReview {
  id: string
  staffId: string
  staff: Staff
  reviewPeriod: string
  reviewerName: string
  ratings: PerformanceRatings
  overallRating: number
  strengths?: string
  areasForImprovement?: string
  goals: PerformanceGoal[]
  status: ReviewStatus
  createdAt: string
  acknowledgedAt?: string
}

//  Form Types

export interface PerformanceReviewFormData {
  staffId: string
  reviewPeriod: string
  reviewerName: string
  ratings: PerformanceRatings
  strengths?: string
  areasForImprovement?: string
  goalsText?: string // one goal per line, split into PerformanceGoal[] on submit
}

//  API / Query Types

export interface PerformanceFilters {
  staffId?: string
  reviewPeriod?: string
  status?: ReviewStatus
}
