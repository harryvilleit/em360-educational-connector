import type { DrawCommand } from "./renderDocument"

export function CanvasCommands({
  commands,
  font = "DocumentSans",
}: {
  commands: DrawCommand[]
  font?: string
}) {
  return (
    <>
      {commands.map((c, i) => {
        if (c.type === "text")
          return (
            <text
              key={i}
              x={c.x}
              y={c.y}
              fontFamily={c.font ?? font}
              fontSize={(c.size * 25.4) / 72}
              fontWeight={c.bold ? 700 : 400}
              fill={c.colour}
              textAnchor={
                c.align === "center"
                  ? "middle"
                  : c.align === "right"
                    ? "end"
                    : "start"
              }
            >
              {c.value}
            </text>
          )
        if (c.type === "image")
          return (
            <image
              key={i}
              href={c.url}
              x={c.x}
              y={c.y}
              width={c.width}
              height={c.height}
              preserveAspectRatio="none"
            />
          )
        const props = {
          fill: c.fill ?? "none",
          stroke: c.stroke ?? "none",
          strokeWidth: c.strokeWidth ?? 0.2,
        }
        if (c.shape === "ellipse")
          return (
            <ellipse
              key={i}
              cx={c.x + c.width / 2}
              cy={c.y + c.height / 2}
              rx={c.width / 2}
              ry={c.height / 2}
              {...props}
            />
          )
        if (c.shape === "line")
          return (
            <line
              key={i}
              x1={c.x}
              y1={c.y + c.height / 2}
              x2={c.x + c.width}
              y2={c.y + c.height / 2}
              stroke={c.stroke ?? c.fill ?? "#172033"}
              strokeWidth={c.strokeWidth ?? 0.2}
            />
          )
        return (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width={c.width}
            height={c.height}
            {...props}
          />
        )
      })}
    </>
  )
}
