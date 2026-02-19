'use server';

import { StripeService } from '@/lib/services/stripe/stripe.service';
import { UpdateContributorAfterCheckoutInput } from '@/lib/services/stripe/stripe.types';
import { getOptionalContributor } from '../firebase/current-contributor';

export const createStripeCheckoutAction = async (input: {
  amount: number;
  intervalCount?: number;
  currency?: string;
  successUrl: string;
  recurring?: boolean;
  campaignId?: string;
}) => {
  const contributor = await getOptionalContributor();
  const stripe = new StripeService();

  return stripe.createCheckoutSession({
    ...input,
    stripeCustomerId: contributor?.stripeCustomerId ?? null,
  });
};

export const updateContributorAfterCheckoutAction = async (input: UpdateContributorAfterCheckoutInput) => {
  const stripeService = new StripeService();

  return stripeService.updateContributorAfterCheckout(input);
};
