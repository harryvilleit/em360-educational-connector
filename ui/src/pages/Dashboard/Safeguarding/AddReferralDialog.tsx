import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAddSafeguardingReferral } from "@/hooks/safeguarding"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type { SafeguardingReferralAgency, SafeguardingReferralStatus } from "@/api/safeguarding.api"
import { FormField } from "./components"
import {
  inputClass,
  textareaClass,
  toLocalDateTimeInput,
} from "./utils"
import type { DialogProps } from "./caseDialogTypes"

export default function AddReferralDialog({
  open,
  onClose,
  schoolId,
  item,
}: DialogProps) {
  const mutation = useAddSafeguardingReferral()
  const { settings } = useStudentSupportSettings(schoolId)
  const [agency, setAgency] = useState<SafeguardingReferralAgency>(
    "ChildrensSocialCare"
  )
  const [agencyName, setAgencyName] = useState("")
  const [contact, setContact] = useState("")
  const [contactDetails, setContactDetails] = useState("")
  const [reference, setReference] = useState("")
  const [status, setStatus] = useState<SafeguardingReferralStatus>("Submitted")
  const [referredAt, setReferredAt] = useState(toLocalDateTimeInput(new Date()))
  const [reason, setReason] = useState("")
  const [response, setResponse] = useState("")
  function submit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        agency,
        agencyName: agencyName || undefined,
        contactName: contact || undefined,
        contactDetails: contactDetails || undefined,
        externalReference: reference || undefined,
        status,
        referredAtUtc: new Date(referredAt).toISOString(),
        reason,
        responseSummary: response || undefined,
      },
      { onSuccess: onClose }
    )
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record external referral</DialogTitle>
          <DialogDescription>
            Capture where, when and why information was referred.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Agency">
              <select
                className={inputClass}
                value={agency}
                onChange={(e) =>
                  setAgency(e.target.value as SafeguardingReferralAgency)
                }
              >
                {(settings?.referralAgencies ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Agency name">
              <input
                className={inputClass}
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </FormField>
            <FormField label="Contact person">
              <input
                className={inputClass}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </FormField>
            <FormField label="Contact details">
              <input
                className={inputClass}
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
              />
            </FormField>
            <FormField label="External reference">
              <input
                className={inputClass}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </FormField>
            <FormField label="Referral status">
              <select
                className={inputClass}
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as SafeguardingReferralStatus)
                }
              >
                {[
                  "Draft",
                  "Submitted",
                  "Acknowledged",
                  "Accepted",
                  "Declined",
                  "Closed",
                ].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Referred at">
              <input
                required
                type="datetime-local"
                className={inputClass}
                value={referredAt}
                onChange={(e) => setReferredAt(e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Reason for referral">
            <textarea
              required
              className={textareaClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormField>
          <FormField label="Response or outcome to date">
            <textarea
              className={textareaClass}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Record referral"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
