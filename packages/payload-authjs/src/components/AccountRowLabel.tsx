"use client";

import { useRowLabel } from "@payloadcms/ui";
import type { DataFromCollectionSlug } from "payload";
import type { AuthCollectionSlug } from "../payload/plugin";

type Account = NonNullable<DataFromCollectionSlug<AuthCollectionSlug>["accounts"]>[0];

export const AccountRowLabel = () => {
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
