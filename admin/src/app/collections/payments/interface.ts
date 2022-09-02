export type Payment = {
  amount: number;
  currency: string;
  payment_at: Date;
  status: string;
  confirm_at: Date;
  contest_at: Date;
  contest_reason: string;
};
