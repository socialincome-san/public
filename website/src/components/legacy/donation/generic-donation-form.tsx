'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { BankTransferForm, BankTransferFormProps } from '@/components/legacy/donation/bank-transfer-form';
import { DonationInterval } from '@/components/legacy/donation/donation-interval';
import { CurrencySelector } from '@/components/legacy/ui/currency-selector';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { createStripeCheckoutAction } from '@/lib/server-actions/stripe-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, Input } from '@socialincome/ui';
import { ToggleGroup, ToggleGroupItem } from '@socialincome/ui/src/components/toggle-group';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type DonationFormProps = {
  defaultInterval: DonationInterval;
  translations: {
    monthly: string;
    oneTime: string;
    amount: string;
    submit: string;
    paymentType: {
      bankTransfer: string;
      creditCard: string;
    };
    bankTransfer: BankTransferFormProps['translations'];
  };
  campaignId?: string;
} & DefaultParams;

export const PaymentTypes = {
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
} as const;

export type PaymentType = (typeof PaymentTypes)[keyof typeof PaymentTypes];

export const GenericDonationForm = ({ defaultInterval, translations, lang, region, campaignId }: DonationFormProps) => {
  const router = useRouter();
  const { currency } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const formSchema = z
    .object({
      interval: z.coerce.string(),
      paymentType: z.enum(Object.values(PaymentTypes) as [string, ...string[]]).default(PaymentTypes.CREDIT_CARD),
      amount: z.coerce.number().min(1),
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.paymentType === PaymentTypes.BANK_TRANSFER) {
        if (!data.email) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'] });
        } else if (!z.string().email().safeParse(data.email).success) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'] });
        }
        if (!data.firstName) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['firstName'] });
        }
        if (!data.lastName) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lastName'] });
        }
      }
    });

  type FormSchema = z.infer<typeof formSchema>;
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interval: defaultInterval,
      amount: 100,
      paymentType: PaymentTypes.CREDIT_CARD,
      email: '',
      firstName: '',
      lastName: '',
    },
  });
  const interval = form.watch('interval');

  const onSubmit = async (values: FormSchema) => {
    setSubmitting(true);
    const result = await createStripeCheckoutAction({
      amount: values.amount * 100,
      currency,
      successUrl: `${window.location.origin}/${lang}/${region}/donate/success/stripe/{CHECKOUT_SESSION_ID}`,
      recurring: values.interval === DonationInterval.Monthly,
      intervalCount: values.interval === DonationInterval.Monthly ? 1 : undefined,
      campaignId,
    });

    setSubmitting(false);

    if (!result.success) {
      console.error(result.error);

      return;
    }

    router.push(result.data);
  };

  return (
    <div className="flex flex-col space-y-8 text-center sm:text-left">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem className="flex-1 sm:basis-2/3">
                <FormControl>
                  <ToggleGroup
                    type="single"
                    className={'mb-4 inline-flex rounded-full bg-popover'}
                    value={field.value}
                    onValueChange={(v: string) => form.setValue('interval', v)}
                  >
                    <ToggleGroupItem
                      key={DonationInterval.OneTime}
                      className="text-md m-1 rounded-full px-6"
                      value={DonationInterval.OneTime}
                    >
                      {translations.oneTime}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      key={DonationInterval.Monthly}
                      className="text-md m-1 rounded-full px-6"
                      value={DonationInterval.Monthly}
                    >
                      {translations.monthly}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
              </FormItem>
            )}
          ></FormField>
          <div className={'mb-4'}>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1 sm:basis-2/3">
                  <FormControl>
                    <div>
                      <ToggleGroup
                        type="single"
                        className={'mb-4'}
                        value={field.value.toString()}
                        onValueChange={(v: string) => {
                          if (v) {
                            form.setValue('amount', Number.parseInt(v));
                          }
                        }}
                      >
                        {createToggleGroupItems(
                          interval === DonationInterval.Monthly ? [10, 30, 100, 150, 200] : [25, 50, 100, 500, 1000],
                        )}
                      </ToggleGroup>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 sm:space-y-0 md:items-center">
                        <Input className="mb-4 h-12 text-lg sm:mb-0" {...field} />
                        <CurrencySelector
                          className="h-12 sm:basis-1/3 md:max-w-[12rem]"
                          currencies={['USD', 'EUR', 'CHF']}
                          fontSize="md"
                        />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          {region === 'ch' && ['CHF', 'EUR'].includes(currency || '') && (
            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem className="flex-1 sm:basis-2/3">
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        className="mb-4 inline-flex rounded-full bg-popover"
                        value={field.value}
                        onValueChange={(value: string) => form.setValue('paymentType', value)}
                      >
                        <ToggleGroupItem className="text-md m-1 rounded-full px-6" value={PaymentTypes.CREDIT_CARD}>
                          {translations.paymentType.creditCard}
                        </ToggleGroupItem>
                        <ToggleGroupItem className="text-md m-1 rounded-full px-6" value={PaymentTypes.BANK_TRANSFER}>
                          {translations.paymentType.bankTransfer}
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
          {form.watch('paymentType') === PaymentTypes.BANK_TRANSFER ? (
            <div className="flex flex-col space-y-4 rounded-lg bg-blue-50 p-4 md:p-8">
              <BankTransferForm
                amount={form.watch('amount')}
                intervalCount={form.watch('interval') === DonationInterval.Monthly ? 1 : 0}
                translations={translations.bankTransfer}
                lang={lang as WebsiteLanguage}
                region={region as WebsiteRegion}
                qrBillType="QRCODE"
              />
            </div>
          ) : (
            <Button
              size="lg"
              type="submit"
              variant="default"
              showLoadingSpinner={submitting}
              className="rounded-full bg-accent text-lg font-medium text-accent-foreground hover:bg-accent-muted active:bg-accent-muted"
            >
              {translations.submit}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

const createToggleGroupItems = (values: number[]) => {
  return values.map((value) => (
    <ToggleGroupItem
      key={value}
      style={{ width: '100%' }}
      className="text-md rounded-full bg-popover py-6"
      value={value.toString()}
    >
      {value}
    </ToggleGroupItem>
  ));
};
