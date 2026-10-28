export function formatSchoolBlogDate(isoDate?: string | null): string {
  if (!isoDate) return "Not published"
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
