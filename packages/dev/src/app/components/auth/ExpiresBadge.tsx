import type { ComponentProps } from "react";
import Badge from "../general/Badge";

export const ExpiresBadge = ({
  expiresAt: expiresAtString,
  title,
  ...props
}: {
  title: string;
  expiresAt?: string | null;
} & Omit<ComponentProps<typeof Badge>, "variant" | "children">) => {
  if (!expiresAtString) {
    return null;
  }

  const expiresAt = new Date(expiresAtString);

  return (
    <Badge variant="yellow" {...props}>
      {title}: {expiresAt.toLocaleString()} ({formatRelativeTime(expiresAt)})
    </Badge>
  );
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat();

  if (diffInSeconds < 60) {
    return rtf.format(diffInSeconds, "seconds");
  } else if (diffInSeconds < 3600) {
    return rtf.format(Math.floor(diffInSeconds / 60), "minutes");
  } else if (diffInSeconds < 86400) {
    return rtf.format(Math.floor(diffInSeconds / 3600), "hours");
  } else {
    return rtf.format(Math.floor(diffInSeconds / 86400), "days");
  }
};
