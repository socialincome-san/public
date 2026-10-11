import { type useTranslations } from 'next-intl';

export type ColumnLabelTranslator = ReturnType<typeof useTranslations<'website-common'>>;

type ColumnLabelKey =
	| 'column-period'
	| 'column-recipients'
	| 'column-amount'
	| 'column-amount-usd'
	| 'column-recipient'
	| 'column-status'
	| 'column-age'
	| 'column-local-partner'
	| 'column-program'
	| 'column-progress'
	| 'column-created'
	| 'column-firebase-auth-user-id'
	| 'column-payment-code'
	| 'country'
	| 'start-date';

export const columnLabel = (t: ColumnLabelTranslator | undefined, key: ColumnLabelKey, fallback: string): string =>
	t ? t(`program-detail-page.${key}`) : fallback;
