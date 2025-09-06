import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 text-base font-light text-gray-200 shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-light file:text-gray-200 placeholder:text-gray-500 hover:shadow-lg hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
