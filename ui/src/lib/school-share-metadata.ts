export type ShareSchool = {
  id: string
  slug?: string | null
  name: string
  description?: string | null
  tagline?: string | null
  coverImageUrl?: string | null
  logoUrl?: string | null
}
export type SchoolShareMetadata = {
  type?: "website" | "article"
  title: string
  description: string
  url: string
  image: string
  imageAlt: string
}

const tabNames: Record<string, string> = {
  courses: "Courses",
  pricing: "Pricing & Fees",
  reviews: "Reviews",
}

export function plainText(value: string | null | undefined) {
  return (value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(
      /&(?:nbsp|amp|quot|apos|lt|gt);/gi,
      (entity) =>
        ({
          "&nbsp;": " ",
          "&amp;": "&",
          "&quot;": '"',
          "&apos;": "'",
          "&lt;": "<",
          "&gt;": ">",
        })[entity.toLowerCase()] || entity
    )
    .replace(/\s+/g, " ")
    .trim()
}

export function getSchoolShareMetadata(
  school: ShareSchool,
  requestedTab: string | null,
  origin: string
): SchoolShareMetadata {
  const name = plainText(school.name) || "School profile"
  const tab =
    requestedTab && Object.hasOwn(tabNames, requestedTab)
      ? requestedTab
      : "overview"
  const url = new URL(
    `/schools/${encodeURIComponent(school.slug || school.id)}`,
    origin
  )
  if (tab !== "overview") url.searchParams.set("tab", tab)
  const introduction =
    plainText(school.tagline) || plainText(school.description)
  const prefix =
    tab === "pricing"
      ? `Explore tuition fees and payment options at ${name}.`
      : tab === "courses"
        ? `Explore courses offered by ${name}.`
        : tab === "reviews"
          ? `Read reviews of ${name}.`
          : ""
  const description =
    `${prefix} ${introduction || `Discover ${name}, browse courses and request information on EM360.`}`.trim()
  let image = new URL("/em360-logo.png", origin).href
  for (const candidate of [school.coverImageUrl, school.logoUrl]) {
    if (!candidate) continue
    try {
      const parsed = new URL(candidate, origin)
      if (
        parsed.protocol === "https:" &&
        !parsed.username &&
        !parsed.password
      ) {
        image = parsed.href
        break
      }
    } catch {
      /* Use the next public image. */
    }
  }
  return {
    title: `${name}${tabNames[tab] ? ` | ${tabNames[tab]}` : ""} | EM360`,
    description:
      description.length > 240
        ? description.slice(0, 237).trimEnd() + "…"
        : description,
    url: url.href,
    image,
    imageAlt: `${name} — school profile`,
  }
}
