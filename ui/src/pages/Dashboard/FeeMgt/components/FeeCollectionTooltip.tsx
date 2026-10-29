/* eslint-disable @typescript-eslint/no-explicit-any */
const FeeCollectionTooltip = ({ active, payload, label, formatMoney }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="mb-1 font-semibold text-gray-700">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}:{" "}
            <span className="font-bold">{formatMoney(Number(p.value))}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default FeeCollectionTooltip
