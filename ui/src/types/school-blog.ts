export type SchoolBlogStatus = "Draft" | "Published"

export type SchoolBlogCategory =
  | "News"
  | "Events"
  | "Announcements"
  | "Achievements"

export interface SchoolBlogPost {
  id: string
  schoolId: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImageUrl?: string | null
  category: SchoolBlogCategory
  authorName: string
  status: SchoolBlogStatus
  publishedAtUtc?: string | null
  readTimeMinutes: number
  dateCreated: string
  dateModified: string
}

export interface SchoolBlogPostInput {
  title: string
  excerpt: string
  content: string
  category: SchoolBlogCategory
  authorName: string
  status: SchoolBlogStatus
  coverImage?: File | null
}

export interface SchoolBlogList {
  items: SchoolBlogPost[]
  totalItems: number
  publishedItems: number
  draftItems: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export const SCHOOL_BLOG_CATEGORIES: SchoolBlogCategory[] = [
  "News",
  "Events",
  "Announcements",
  "Achievements",
]
