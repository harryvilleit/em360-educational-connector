import { useState } from "react"
import { reactHealthRequest } from "./ReactHealthPage"
import {
  LoadState,
  Pager,
  time,
  useData,
  useHealthRefresh,
  type Row,
} from "./shared"
import "./HealthApp.css"
export default function ParentHealthInbox({ schoolId }: { schoolId: string }) {
  const [page, setPage] = useState(1),
    [error, setError] = useState("")
  const [revision, refresh] = useHealthRefresh()
  const base = `/HealthRecord/schools/${schoolId}/parent-notifications`
  const state = useData(
    reactHealthRequest,
    schoolId ? base : null,
    { pageNumber: page, pageSize: 10 },
    revision
  )
  return (
    <section className="hw" aria-label="School health messages">
      <div className="hw-card">
        <header>
          <div>
            <h2>School health messages</h2>
            <p className="description">
              Private messages from your school’s health team
            </p>
          </div>
        </header>
        {error && (
          <p role="alert" className="hw-alert">
            {error}
          </p>
        )}
        <LoadState state={state} retry={refresh}>
          {state.data?.items?.length ? (
            state.data.items.map((r: Row) => (
              <article key={r.id} className="hw-record">
                <h3>{r.title}</h3>
                <p>{r.message}</p>
                <small>
                  {time(r.dateCreated)} · {r.isRead ? "Read" : "Unread"}
                </small>
                {!r.isRead && (
                  <div className="actions">
                    <button
                      onClick={async () => {
                        try {
                          await reactHealthRequest(
                            `${base}/${r.id}/read`,
                            "POST",
                            {}
                          )
                          refresh()
                        } catch (e) {
                          setError(
                            e instanceof Error
                              ? e.message
                              : "Unable to update message."
                          )
                        }
                      }}
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="hw-empty">No school health messages.</p>
          )}
          <Pager data={state.data} page={page} setPage={setPage} />
        </LoadState>
      </div>
    </section>
  )
}
