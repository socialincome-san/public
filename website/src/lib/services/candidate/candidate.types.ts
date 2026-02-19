import { Address, Gender, PaymentProvider, Phone, Prisma } from '@/generated/prisma/client';

export enum Profile {
  male = 'male',
  female = 'female',
  youth = 'youth',
}

export type CandidatePayload = {
  id: string;
  suspendedAt: Date | null;
  suspensionReason: string | null;
  successorName: string | null;
  termsAccepted: boolean;
  localPartner: {
    id: string;
    name: string;
  };
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
    phone: Phone | null;
    address: Address | null;
  };
  paymentInformation: {
    id: string;
    code: string | null;
    provider: PaymentProvider | null;
    phone: Phone | null;
  } | null;
};

export type CandidatesTableViewRow = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  localPartnerName: string | null;
  suspendedAt: Date | null;
  suspensionReason: string | null;
  createdAt: Date;
};

export type CandidatesTableView = {
  tableRows: CandidatesTableViewRow[];
};

export type CandidateCreateInput = Prisma.RecipientCreateInput;
export type CandidateUpdateInput = Prisma.RecipientUpdateInput;
export type CandidatePrismaUpdateInput = Prisma.RecipientUpdateInput;
