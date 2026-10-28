import { GraduationCap } from "lucide-react"

export default function PageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-white">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 animate-spin rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500" />

        <div className="absolute h-16 w-16 animate-[spin-reverse_1s_linear_infinite] rounded-full border-4 border-transparent border-t-pink-500 border-r-blue-700" />

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(to_bottom_right,#1d4ed8,#2563eb,#4338ca)]">
          <GraduationCap className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <h1 className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-3xl font-bold text-transparent">
          EM360
        </h1>
        <p className="animate-pulse text-sm text-muted-foreground">
          Loading, please wait...
        </p>
      </div>

      <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-full animate-[progress_1.5s_ease-in-out_infinite] rounded-full bg-[linear-gradient(to_right,#6366f1,#a855f7,#ec4899)]" />
      </div>
    </div>
  )
}
