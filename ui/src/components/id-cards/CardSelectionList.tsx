import { useMemo, useState } from "react"
import { SearchInput } from "@/components/ui/search-input"
import type { SchoolIdCard } from "@/lib/idCards"

interface CardSelectionListProps {
  cards: SchoolIdCard[]
  selectedIds: Set<string>
  onChange: (next: Set<string>) => void
}

export default function CardSelectionList({
  cards,
  selectedIds,
  onChange,
}: CardSelectionListProps) {
  const [search, setSearch] = useState("")

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return cards
    return cards.filter(
      (card) =>
        card.name.toLowerCase().includes(term) ||
        card.displayId.toLowerCase().includes(term)
    )
  }, [cards, search])

  const allSelected = selectedIds.size === cards.length

  function toggle(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() =>
              onChange(
                allSelected ? new Set() : new Set(cards.map((c) => c.personId))
              )
            }
            className="size-4 accent-blue-600"
          />
          Select all ({selectedIds.size} of {cards.length} selected)
        </label>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or ID..."
        />
      </div>
      <ul className="max-h-60 divide-y overflow-y-auto rounded-lg border">
        {visible.length === 0 ? (
          <li className="p-3 text-sm text-muted-foreground">No matches.</li>
        ) : (
          visible.map((card) => (
            <li key={card.personId}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedIds.has(card.personId)}
                  onChange={() => toggle(card.personId)}
                  className="size-4 accent-blue-600"
                />
                <span className="font-medium">{card.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {card.className ?? card.role} · {card.displayId}
                </span>
              </label>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
