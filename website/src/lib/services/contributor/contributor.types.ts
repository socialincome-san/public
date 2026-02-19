import {
  Address,
  ContributorReferralSource,
  CountryCode,
  Gender,
  OrganizationPermission,
  Phone,
  Prisma,
} from '@/generated/prisma/client';

export type ContributorTableViewRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string | null;
  createdAt: Date;
  permission: OrganizationPermission;
};

export type ContributorTableView = {
  tableRows: ContributorTableViewRow[];
};

export type ContributorPayload = {
  id: string;
  referral: ContributorReferralSource;
  paymentReferenceId: string | null;
  stripeCustomerId: string | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    callingName: string | null;
    email: string | null;
    gender: Gender | null;
    language: string | null;
    dateOfBirth: Date | null;
    profession: string | null;
    address: Address | null;
    phone: Phone | null;
  };
};

export type ContributorUpdateInput = Prisma.ContributorUpdateInput;

export type ContributorOption = {
  id: string;
  name: string;
};

export type ContributorDonationCertificate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  language: string | null;
  address: Address | null;
  authId: string;
};

export type ContributorWithContact = Prisma.ContributorGetPayload<{
  include: { contact: true };
}>;

export type StripeContributorData = {
  stripeCustomerId: string;
  email: string;
  firstName: string;
  lastName: string;
  referral: ContributorReferralSource;
};

export type BankContributorData = {
  paymentReferenceId: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
};

export type ContributorSession = {
  type: 'contributor';
  id: string;
  gender: Gender | null;
  referral: ContributorReferralSource;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  language: string | null;
  street: string | null;
  number: string | null;
  city: string | null;
  zip: string | null;
  country: CountryCode | null;
  stripeCustomerId: string | null;
};

export type ContributorFormCreateInput = {
  firstName: string;
  lastName: string;
  email: string;
  referral: ContributorReferralSource;
  gender?: Gender | null;
  language?: string | null;
  dateOfBirth?: Date | null;
  profession?: string | null;
  callingName?: string | null;
  address?: {
    street: string;
    number: string;
    city: string;
    zip: string;
    country: CountryCode;
  } | null;
};
