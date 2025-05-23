"use client";

import type { User } from "@/payload-types";
import { Banner, useAuth } from "@payloadcms/ui";

/**
 * Greeting banner that displays the current user
 */
const Greeting = () => {
  const { user } = useAuth<User>();

  if (!user) {
    return null;
  }

  return (
    <Banner type="success">
      Hi, {user.name} ({user.email})
    </Banner>
  );
};

export default Greeting;
