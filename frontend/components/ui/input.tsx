import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-200",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
