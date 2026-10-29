import { Link } from "react-router"

interface RequiredDataNoticeProps {
  itemLabel: string
  pageLabel: string
  to: string
}

export function RequiredDataNotice({
  itemLabel,
  pageLabel,
  to,
}: RequiredDataNoticeProps) {
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600">
      Create {itemLabel} in the{" "}
      <Link to={to} className="underline hover:text-red-700">
        {pageLabel}
      </Link>{" "}
      page first.
    </p>
  )
}
