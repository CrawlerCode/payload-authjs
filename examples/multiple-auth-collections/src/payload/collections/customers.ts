import { Admin, Customer } from "@/payload-types";
import type { Access, CollectionConfig } from "payload";

const myselfOrAdminAccess: Access<Customer | Admin> = ({ req: { user } }) => {
  // User is required
  if (!user) {
    return false;
  }

  // If user is an admin, allow to read all users
  if (user.collection === "admins") {
    return true;
  }

  // If user is a customer, only allow to read current user
  if (user.collection === "customers") {
    return {
      id: {
        equals: user.id,
      },
    };
  }

  return false;
};

const Customers: CollectionConfig = {
  slug: "customers",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: myselfOrAdminAccess,
    update: myselfOrAdminAccess,
    create: myselfOrAdminAccess,
  },
  fields: [
    {
      name: "customerNumber",
      type: "text",
      required: true,
      unique: true,
      defaultValue: () => Math.floor(Math.random() * 1000000).toString(),
      access: {
        update: () => false,
      },
    },
  ],
};

export default Customers;
