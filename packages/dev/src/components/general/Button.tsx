import clsx from "clsx";
import type { ComponentProps } from "react";

export function Button({ type = "button", className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={clsx(
        "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_img]:shrink-0 [&_img:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        "h-9 px-4 py-2 has-[>img]:px-3 has-[>svg]:px-3",
        className,
      )}
      {...props}
    />
  );
}
