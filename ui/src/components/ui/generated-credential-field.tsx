import { useState } from "react"
import { toast } from "sonner"
import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

interface GeneratedEmailFieldProps {
  id?: string
  value: string
  onGenerate: () => void
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  isDefaultEmail: boolean
  error?: string
}

export function GeneratedEmailField({
  id,
  value,
  onGenerate,
  onChange,
  className,
  disabled,
  isDefaultEmail,
  error,
}: GeneratedEmailFieldProps) {
  const [copied, setCopied] = useState(false)
  const generated = value.length > 0

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Email copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy — select the field and copy it manually")
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <InputGroup className="min-w-0 flex-1 basis-48 rounded-md">
        <InputGroupInput
          id={id}
          type="email"
          required={!isDefaultEmail}
          aria-invalid={!!error}
          aria-describedby={error && id ? `${id}-error` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDefaultEmail}
          placeholder={
            !isDefaultEmail
              ? "Enter the student's personal email"
              : disabled
                ? "Enter first and last name first"
                : "Click Generate Email"
          }
        />
        {isDefaultEmail && generated && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              onClick={handleCopy}
              title="Copy email"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {isDefaultEmail && (
        <Button
          type="button"
          variant="outline"
          onClick={onGenerate}
          disabled={generated || disabled}
          className="shrink-0 rounded-md"
        >
          Generate Email
        </Button>
      )}
    </div>
  )
}

interface GeneratedPasswordFieldProps {
  id?: string
  value: string
  onGenerate: () => void
  className?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

export function GeneratedPasswordField({
  id,
  value,
  onGenerate,
  className,
  disabled,
  onChange,
}: GeneratedPasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const editable = !!onChange
  const generated = value.length > 0

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Password copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy — select the field and copy it manually")
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <InputGroup className="rounded-md">
        <InputGroupInput
          id={id}
          value={value}
          onChange={editable ? (e) => onChange?.(e.target.value) : undefined}
          readOnly={!editable}
          disabled={disabled}
          type={visible ? "text" : "password"}

          autoComplete="new-password"
          placeholder={
            disabled
              ? "Enter first and last name first"
              : "Click Generate Password"
          }
          className={
            editable ? undefined : "cursor-default read-only:bg-gray-50"
          }
        />
        {generated && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              onClick={() => setVisible((prev) => !prev)}
              title={visible ? "Hide password" : "Show password"}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </InputGroupButton>
            <InputGroupButton
              type="button"
              size="icon-xs"
              onClick={handleCopy}
              title="Copy password"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <Button
        type="button"
        variant="outline"
        onClick={onGenerate}
        disabled={(!editable && generated) || disabled}
        className="shrink-0 rounded-md"
      >
        Generate Password
      </Button>
    </div>
  )
}
