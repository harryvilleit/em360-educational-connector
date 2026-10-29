import { request, type Row } from "../rebuilt/service"
// Compatibility with the existing school API's enum and DTO contracts.
// The shared React components retain their existing response-envelope contract.
async function all(path: string, params: Row) {
  const rows: Row[] = []
  for (let page = 1; page <= 1000; page++) {
    const data = await request(path, "GET", undefined, {
      ...params,
      pageNumber: page,
      pageSize: 200,
    })
    if (Array.isArray(data)) return data
    if (!Array.isArray(data?.items))
      throw Error("Unable to read the hostel list.")
    rows.push(...data.items)
    const pages = Number(
      data.totalPages || Math.ceil((data.totalItems || rows.length) / 200) || 1
    )
    if (page >= pages) return rows
    if (!data.items.length)
      throw Error("The hostel list is incomplete. Refresh and retry.")
  }
  throw Error("This list is too large. Narrow the filters and retry.")
}
const mapRows = (data: any, fn: (row: Row) => Row): any =>
  Array.isArray(data)
    ? data.map(fn)
    : data?.items
      ? { ...data, items: data.items.map(fn) }
      : data?.id
        ? fn(data)
        : data
async function send(
  method: string,
  path: string,
  body?: Row,
  config?: { params?: Row }
) {
  let params = Object.fromEntries(
    Object.entries(config?.params || {}).map(([k, v]) => [
      k[0].toLowerCase() + k.slice(1),
      v,
    ])
  )
  if (path === "/Hostel/AssignSupervisor")
    body = { ...body, role: body?.role ?? 1 }
  if (["/HostelRoom/Create", "/HostelRoom/Update"].includes(path) && body) {
    const { floor, ...rest } = body
    body = { ...rest, floorId: floor || null, status: body.status ?? 1 }
  }
  if (
    body?.status &&
    ["/Hostel/Update", "/HostelRoom/Update", "/BedSpace/Update"].includes(path)
  ) {
    const names: Row = path.startsWith("/Hostel/")
      ? { Active: 1, Inactive: 2 }
      : path.startsWith("/BedSpace/")
        ? { Active: 1, Inactive: 2, Occupied: 3 }
        : { Active: 1, Inactive: 2, Maintenance: 3 }
    const status =
      typeof body.status === "number" ? body.status : names[body.status]
    if (!status) throw Error("Select a valid status.")
    body = { ...body, status }
  }
  if (path.startsWith("/HostelReport/")) {
    if (body?.reportType !== undefined)
      body = { ...body, reportType: Number(body.reportType) + 1 }
    if (params.reportType !== undefined)
      params = { ...params, reportType: Number(params.reportType) + 1 }
  }
  let value: any
  if (
    method === "GET" &&
    /\/(GetAll|GetAllSupervisors)$/.test(path) &&
    Number(params.pageSize) >= 100
  ) {
    const items = await all(path, params)
    value = {
      items,
      totalItems: items.length,
      totalPages: 1,
      pageNumber: 1,
      pageSize: items.length,
    }
  } else value = await request(path, method, body, params)
  if (method === "GET" && path.startsWith("/HostelRoom/")) {
    const hostels = await all("/Hostel/GetAll", { schoolId: params.schoolId })
    value = mapRows(value, (r) => ({
      ...r,
      floor: r.floorName || "",
      hostelType: hostels.find((h) => h.id === r.hostelId)?.categoryName || "",
      totalBeds: r.totalBeds ?? r.bedSpaceCount ?? 0,
    }))
  }
  if (path.startsWith("/BedSpace/"))
    value = mapRows(value, (r) => ({
      ...r,
      status:
        typeof r.status === "number"
          ? ["", "Active", "Inactive", "Occupied"][r.status] || r.status
          : r.status,
    }))
  if (path.startsWith("/HostelReport/"))
    value = mapRows(value, (r) => ({
      ...r,
      reportType:
        typeof r.reportType === "number"
          ? ["", "PropertyDamage", "Incident"][r.reportType] || r.reportType
          : r.reportType,
      status:
        typeof r.status === "number"
          ? ["", "Reported", "Billed", "Waived"][r.status] || r.status
          : r.status,
    }))
  if (path.startsWith("/HostelAttendance/")) {
    const normalize = (v: any): any =>
      Array.isArray(v)
        ? v.map(normalize)
        : v && typeof v === "object"
          ? Object.fromEntries(
              Object.entries(v).map(([k, x]) => [
                k,
                k === "status" && typeof x === "string"
                  ? ["Present", "Absent", "Late", "Excused"].indexOf(x) + 1 || x
                  : k === "period" && typeof x === "string"
                    ? ["Morning", "Evening", "Night"].indexOf(x) + 1 || x
                    : normalize(x),
              ])
            )
          : v
    value = normalize(value)
  }
  return {
    isSuccess: true,
    isFailure: false,
    statusCode: 200,
    value,
    message: "",
    error: "",
  }
}
export default {
  get: (p: string, c?: { params?: Row }) => send("GET", p, undefined, c),
  post: (p: string, b?: Row) => send("POST", p, b),
  put: (p: string, b?: Row) => send("PUT", p, b),
  patch: (p: string, b?: Row) => send("PATCH", p, b),
  delete: (p: string) => send("DELETE", p),
}
