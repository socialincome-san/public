import { ExpenseType } from '@/generated/prisma/client';

export type ExpenseTableViewRow = {
  id: string;
  type: ExpenseType;
  year: number;
  amountChf: number;
  organizationName: string;
  createdAt: Date;
};

export type ExpenseTableView = {
  tableRows: ExpenseTableViewRow[];
};

export type ExpensePayload = {
  id: string;
  type: ExpenseType;
  year: number;
  amountChf: number;
  organization: { id: string; name: string };
};

export type ExpenseCreateInput = {
  type: ExpenseType;
  year: number;
  amountChf: number;
  organization: { connect: { id: string } };
};

export type ExpenseUpdateInput = {
  id: string;
  type?: ExpenseType;
  year?: number;
  amountChf?: number;
  organization?: { connect: { id: string } };
};
