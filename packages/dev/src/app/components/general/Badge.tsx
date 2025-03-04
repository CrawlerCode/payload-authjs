import clsx from "clsx";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";

interface Props extends ComponentPropsWithoutRef<"span"> {
  variant: "dark" | "blue" | "red" | "green" | "yellow";
  children: ReactNode;
}

const Badge = ({ variant, children, className, ...props }: Props) => {
  return (
    <span
      className={clsx(
        "me-2 rounded-sm px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300": variant === "dark",
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300": variant === "blue",
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300": variant === "red",
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300": variant === "green",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300":
            variant === "yellow",
        },
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
