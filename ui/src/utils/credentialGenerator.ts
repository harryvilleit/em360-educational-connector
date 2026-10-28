function randomInt(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

export function generateRandomPassword(length = 12): string {
  const targetLength = Math.max(length, 12)

  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const special = "!@#$%^&*"

  const allChars = upper + lower + digits + special

  const chars = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    digits[randomInt(digits.length)],
    special[randomInt(special.length)],
  ]

  while (chars.length < targetLength) {
    chars.push(allChars[randomInt(allChars.length)])
  }

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join("")
}

function formatNamePart(name: string, maxLen: number, fallback: string): string {
  if (!name || !name.trim()) {
    return fallback
  }

  const words = name.trim().split(/\s+/)

  if (words.length === 0) {
    return fallback
  }

  let part: string

  if (words.length === 1) {
    part = words[0]
  } else {
    const firstWord = words[0]
    const secondWord = words[1]

    if (firstWord.length <= 3 && secondWord.length > 0) {
      part = firstWord + secondWord.substring(0, 1)
    } else {
      part = firstWord
    }
  }

  const sanitized = part.replace(/[^a-zA-Z0-9]/g, "")

  if (!sanitized) {
    return fallback
  }

  return sanitized.length > maxLen ? sanitized.substring(0, maxLen) : sanitized
}

export function generateStudentEmail(firstName: string, lastName: string): string {
  const firstPart = formatNamePart(firstName, 5, "student").toLowerCase()
  const lastPart = formatNamePart(lastName, 5, "user").toLowerCase()

  const guidSegment = crypto.randomUUID().split("-")[0]

  return `${firstPart}.${lastPart}.${guidSegment}@em360s.com`
}
