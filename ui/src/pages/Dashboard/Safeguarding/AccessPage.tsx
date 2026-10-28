import AccessManagement from "./AccessManagement"
import { SafeguardingAccessGate } from "./components"

export default function SafeguardingAccessPage() {
  return (
    <SafeguardingAccessGate require="configure">
      <AccessManagement />
    </SafeguardingAccessGate>
  )
}
