// Checkout opens in a new tab: the portal runs inside the school's WordPress page,
// so it must not navigate itself away to the payment provider.
import { toast } from "sonner"

export function openCheckout(address: string) {
  const url = new URL(address)
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Invalid checkout address")
  toast(
    <div className="space-y-2">
      <p>Checkout is ready. After payment, return here and refresh the course status.</p>
      <a className="font-semibold text-blue-700 underline" href={url.href} target="_blank" rel="noopener noreferrer">
        Open secure checkout
      </a>
    </div>,
    { duration: Infinity, closeButton: true },
  )
}
