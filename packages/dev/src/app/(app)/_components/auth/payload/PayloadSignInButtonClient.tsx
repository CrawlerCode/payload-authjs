"use client";

import { Button } from "@/components/general/Button";
import { PayloadLogo } from "@/components/img/PayloadLogo";
import { useRouter } from "next/navigation";

/**
 * Sign in using Payload on the client
 */
export function PayloadSignInButtonClient() {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/admin/login")}>
      <PayloadLogo variant="light" />
      Sign In (client)
    </Button>
  );
}
