// The WordPress staff portal links between parent screens only; other EM360 management
// screens are reached through the portal's sidebar menus.
export function managementRouteAvailable(path: string) {
  return /^\/dashboard\/[^/]+\/parents(?:\/|$)/.test(path)
}
