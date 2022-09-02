import { buildCollection, buildProperties } from "@camberi/firecms";
import { AdminUser } from "./interface";

export const adminsCollection = buildCollection<AdminUser>({
  name: "Administrators",
  group: "Admin",
  path: "admins",
  icon: "SupervisorAccountTwoTone",
  description: "Lists all admins for this admin panel",
  customId: true,
  properties: buildProperties<AdminUser>({
    is_global_admin: {
      dataType: "boolean",
      name: "Global Admin",
    },
    name: {
      dataType: "string",
      name: "Full Name",
    },
    organisations: {
      dataType: "array",
      of: {
        dataType: "reference",
        path: "organisations",
      },
    },
  }),
});
