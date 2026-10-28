import { useRef } from "react"
import { Upload } from "lucide-react"

export function UploadZone({
  onFile,
  isDragging,
  setIsDragging,
}: {
  onFile: (file: File) => void
  isDragging: boolean
  setIsDragging: (v: boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith(".csv")) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
        <Upload className="size-7 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">
          Drop your CSV file here, or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Only .csv files are supported
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
    </div>
  )
}
