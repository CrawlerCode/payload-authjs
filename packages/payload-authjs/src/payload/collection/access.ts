import type { Access, CollectionConfig, User } from "payload";

const myselfAccess: Access<User> = ({ req: { user } }) => {
  // User is required
  if (!user) {
    return false;
  }

  // Only allow to read, update and delete current user
  return {
    id: {
      equals: user.id,
    },
  };
};

/**
 * Override the default access control.
 * Only allow users to read, update and delete their own user
 */
export const defaultAccess: CollectionConfig["access"] = {
  read: myselfAccess,
  readVersions: () => false,
  create: () => false,
  update: myselfAccess,
  delete: myselfAccess,
  unlock: () => false,
};
