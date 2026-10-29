import type { CountryCode } from "@/utils/phone"

export type IdentityDocumentOption = {
  id: string
  label: string
  hint?: string
}

const DEFAULT_IDENTITY_OPTIONS: IdentityDocumentOption[] = [
  {
    id: "national_id",
    label: "National ID card",
    hint: "Government-issued photo ID",
  },
  {
    id: "passport",
    label: "International passport",
    hint: "Valid passport bio page",
  },
  {
    id: "drivers_license",
    label: "Driver's license",
    hint: "Front and back if applicable",
  },
]

const COUNTRY_IDENTITY_OPTIONS: Partial<
  Record<CountryCode, IdentityDocumentOption[]>
> = {
  NG: [
    {
      id: "nin",
      label: "National Identification Number (NIN)",
      hint: "NIN slip or digital ID",
    },
    {
      id: "passport",
      label: "International passport",
      hint: "Valid Nigerian passport",
    },
    {
      id: "drivers_license",
      label: "Driver's license",
      hint: "FRSC-issued license",
    },
    {
      id: "voters_card",
      label: "Voter's card",
      hint: "Permanent Voter's Card (PVC)",
    },
  ],
  US: [
    { id: "passport", label: "US passport", hint: "Passport book or card" },
    {
      id: "drivers_license",
      label: "State driver's license",
      hint: "Valid state-issued license",
    },
    {
      id: "state_id",
      label: "State ID card",
      hint: "Non-driver state photo ID",
    },
  ],
  GB: [
    { id: "passport", label: "UK passport", hint: "Valid British passport" },
    {
      id: "drivers_license",
      label: "UK driving licence",
      hint: "Photocard licence",
    },
    {
      id: "brp",
      label: "Biometric residence permit",
      hint: "For non-UK nationals",
    },
  ],
  CA: [
    {
      id: "passport",
      label: "Canadian passport",
      hint: "Valid Canadian passport",
    },
    {
      id: "drivers_license",
      label: "Provincial driver's licence",
      hint: "Valid provincial photo ID",
    },
    {
      id: "health_card",
      label: "Provincial photo health card",
      hint: "Where accepted as ID",
    },
  ],
  GH: [
    { id: "ghana_card", label: "Ghana Card", hint: "National ID card" },
    {
      id: "passport",
      label: "Ghana passport",
      hint: "Valid passport bio page",
    },
    { id: "voters_id", label: "Voter's ID", hint: "Electoral Commission ID" },
  ],
  KE: [
    {
      id: "national_id",
      label: "National ID",
      hint: "Huduma Namba or national ID card",
    },
    {
      id: "passport",
      label: "Kenyan passport",
      hint: "Valid passport bio page",
    },
    {
      id: "drivers_license",
      label: "Driver's license",
      hint: "NTSA-issued license",
    },
  ],
  ZA: [
    {
      id: "smart_id",
      label: "Smart ID card",
      hint: "South African ID book or card",
    },
    {
      id: "passport",
      label: "South African passport",
      hint: "Valid passport bio page",
    },
    {
      id: "drivers_license",
      label: "Driver's license",
      hint: "Valid driving licence",
    },
  ],
  IN: [
    { id: "aadhaar", label: "Aadhaar card", hint: "UIDAI-issued ID" },
    { id: "pan", label: "PAN card", hint: "Permanent Account Number card" },
    {
      id: "passport",
      label: "Indian passport",
      hint: "Valid passport bio page",
    },
    { id: "voters_id", label: "Voter's ID", hint: "Election Commission ID" },
  ],
}

export function getIdentityDocumentOptions(
  countryIso: CountryCode | ""
): IdentityDocumentOption[] {
  if (!countryIso) return []
  return COUNTRY_IDENTITY_OPTIONS[countryIso] ?? DEFAULT_IDENTITY_OPTIONS
}

export function getIdentityDocumentLabel(
  countryIso: CountryCode | "",
  documentId: string
): string {
  const options = getIdentityDocumentOptions(countryIso)
  return options.find((o) => o.id === documentId)?.label ?? "Identity document"
}
