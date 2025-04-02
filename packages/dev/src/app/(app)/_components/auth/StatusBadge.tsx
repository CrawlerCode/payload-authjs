import Badge from "@/components/general/Badge";
import type { ComponentProps } from "react";

export const StatusBadge = ({
  status,
  ...props
}: {
  status: "authenticated" | "unauthenticated" | "loading";
} & Omit<ComponentProps<typeof Badge>, "variant" | "children">) => {
  return (
    <Badge
      variant={status === "authenticated" ? "green" : status === "loading" ? "yellow" : "red"}
      {...props}
    >
      Status: {status}
    </Badge>
  );
};
