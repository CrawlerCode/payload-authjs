"use client";

import { useRowLabel } from "@payloadcms/ui";
import type { FC } from "react";
import type { Account } from "../authjs/types";

export const AccountRowLabel: FC = () => {
  const { data: account } = useRowLabel<Account>();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <img
        loading="lazy"
        src={`https://authjs.dev/img/providers/${account.provider}.svg`}
        alt="Provider"
        style={{
          width: "1.5rem",
          height: "1.5rem",
        }}
      />
      <strong>{account.provider}</strong> ({account.providerAccountId})
    </div>
  );
};
