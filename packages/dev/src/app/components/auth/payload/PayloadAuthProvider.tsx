import { importMap } from "@/app/(payload)/admin/importMap";
import payloadConfig from "@payload-config";
import { initI18n } from "@payloadcms/translations";
import { AuthProvider, ConfigProvider } from "@payloadcms/ui";
import { getClientConfig } from "@payloadcms/ui/utilities/getClientConfig";
import { type ReactNode } from "react";

export const PayloadAuthProvider = async ({ children }: { children: ReactNode }) => {
  const config = await payloadConfig;
  return (
    <ConfigProvider
      config={getClientConfig({
        config,
        i18n: await initI18n({
          config: config.i18n,
          context: "client",
          language: "en",
        }),
        importMap,
      })}
    >
      <AuthProvider>{children}</AuthProvider>
    </ConfigProvider>
  );
};
