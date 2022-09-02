import { EntityReference } from "@camberi/firecms";
import { OrganisationsContributors } from "../organisations_contributors/interface";

export type User = {
  personal: {
    name: string;
    lastname: string;
    gender: string;
    company: string;
    phone: string;
  };
  address: {
    city: string;
    country: string;
    number: string;
    street: string;
    zip: string;
  };
  email: string;
  status: number;
  stripe_customer_id: string;
  test_user: boolean;
  institution: boolean;
  language: string;
  location: string;
  currency: string;
  organisations_contributors?: EntityReference[];
};
