import { PageHeader } from "@/components/general/PageHeader"
import { useRead, type Row } from "../rebuilt/service"
import { QueryState } from "../rebuilt/shared"
export default function Roles() {
  const q = useRead("/WordPressStaff/MyRoles")
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Roles"
        description="Your assigned roles and school permissions"
      />
      <QueryState query={q}>
        <div className="grid gap-4">
          {q.data?.owner && (
            <p className="rounded-xl border bg-white p-5">School owner</p>
          )}
          {q.data?.roles?.map((role: Row) => (
            <article key={role.id} className="rounded-xl border bg-white p-5">
              <h2 className="font-semibold">{role.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{role.description}</p>
            </article>
          ))}
          {!q.data?.roles?.length && !q.data?.owner && (
            <p>No roles have been assigned.</p>
          )}
        </div>
        <section className="mt-6 rounded-xl border bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Your permitted menus</h2>
          {q.data?.modules?.map((module: Row) => (
            <div key={module.id} className="mb-5">
              <h3 className="font-medium">{module.name}</h3>
              <ul className="mt-2 grid gap-2 text-sm text-slate-600">
                {module.menus?.map((menu: Row) => (
                  <li key={menu.id}>
                    {menu.name} — {menu.permissions.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </QueryState>
    </div>
  )
}
