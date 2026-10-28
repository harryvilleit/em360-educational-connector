import { useEffect, useState } from "react"
import type { CSSProperties, KeyboardEventHandler } from "react"
import "country-flag-icons/3x2/flags.css"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  COUNTRY_CALLING_OPTIONS,
  DEFAULT_COUNTRY,
  formatCallingOption,
  formatCompactCallingOption,
  formatPhoneValue,
  parsePhoneValue,
  type CountryCode,
} from "@/utils/phone"

const PHONE_CODE_OPTIONS = COUNTRY_CALLING_OPTIONS.map(formatCallingOption)
const ISO_BY_OPTION = new Map(
  COUNTRY_CALLING_OPTIONS.map((c) => [formatCallingOption(c), c.iso])
)
const COMPACT_LABEL_BY_ISO = new Map(
  COUNTRY_CALLING_OPTIONS.map((c) => [c.iso, formatCompactCallingOption(c)])
)

function CountryFlag({ iso }: { iso?: CountryCode }) {
  if (!iso) return null
  return (
    <span
      role="img"
      aria-label={iso}
      className={`flag:${iso} shrink-0 rounded-xs`}
      style={{ "--CountryFlagIcon-height": "0.75rem" } as CSSProperties}
    />
  )
}

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
  tabIndex?: number
  defaultCountry?: CountryCode
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  className,
  error,
  disabled,
  tabIndex,
  defaultCountry,
}: PhoneInputProps) {
  const [iso, setIso] = useState<CountryCode>(
    () => parsePhoneValue(value, defaultCountry ?? DEFAULT_COUNTRY).iso
  )
  const [local, setLocal] = useState(
    () => parsePhoneValue(value, defaultCountry ?? DEFAULT_COUNTRY).local
  )

  useEffect(() => {
    const parsed = parsePhoneValue(value, defaultCountry ?? DEFAULT_COUNTRY)
    setIso(parsed.iso)
    setLocal(parsed.local)
    // defaultCountry only seeds the initial parse; re-parsing on every
    // defaultCountry change would clobber a number the user is mid-typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (defaultCountry && !local) {
      setIso(defaultCountry)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCountry])

  function emit(nextIso: CountryCode, nextLocal: string) {
    onChange(formatPhoneValue(nextIso, nextLocal))
  }

  return (
    <div
      aria-invalid={error}
      className={cn(
        "flex h-8 w-full min-w-0 items-stretch rounded-lg border border-input bg-transparent py-1 transition-colors focus-within:border-ring",
        error &&
          "border-destructive focus-within:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <Combobox
        value={COMPACT_LABEL_BY_ISO.get(iso) ?? ""}
        onValueChange={(option) => {
          const nextIso = ISO_BY_OPTION.get(option)
          if (!nextIso) return
          setIso(nextIso)
          emit(nextIso, local)
        }}
        options={PHONE_CODE_OPTIONS}
        placeholder="Code"
        searchPlaceholder="Search countries..."
        disabled={disabled}
        className="h-full w-fit shrink-0 rounded-none border-0 bg-transparent px-2.5 shadow-none focus-visible:ring-0 disabled:opacity-100"
        renderValue={() => (
          <>
            <CountryFlag iso={iso} />
            {COMPACT_LABEL_BY_ISO.get(iso)}
          </>
        )}
        renderOption={(option) => (
          <>
            <CountryFlag iso={ISO_BY_OPTION.get(option)} />
            {option}
          </>
        )}
      />
      <div className="my-0.5 w-px shrink-0 bg-input" />
      <Input
        type="tel"
        placeholder={placeholder ?? "8012345678"}
        value={local}
        onChange={(e) => {
          setLocal(e.target.value)
          emit(iso, e.target.value)
        }}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        disabled={disabled}
        className="h-6 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
