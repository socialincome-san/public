import { CURRENCY_COOKIE } from '@/app/[lang]/[region]';
import { defaultCurrency } from '@/i18n';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Page() {
	const currency = cookies().get(CURRENCY_COOKIE)?.value.toLowerCase() || defaultCurrency;
	redirect('./finances/' + currency);
}
