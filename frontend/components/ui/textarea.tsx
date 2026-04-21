import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[80px] w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-200 resize-y",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
