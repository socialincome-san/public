import { DefaultParams } from '@/app/[lang]/[region]';
import { CurrencyRedirect } from '@/app/[lang]/[region]/(website)/transparency/(components)/currency-redirect';
import { websiteCurrencies, WebsiteCurrency } from '@/lib/i18n/utils';
import { Currency } from '@/lib/types/currency';
import { SelectionFaq } from './(sections)/faq';
import { HeroSection } from './(sections)/hero-section';
import { PastRounds } from './(sections)/past-rounds';
import { Resources } from './(sections)/resources';
import { SelectionProcess } from './(sections)/selection-process';

export const revalidate = 3600; // update once an hour
export const generateStaticParams = () => websiteCurrencies.map((currency) => ({ currency: currency.toLowerCase() }));

interface TransparencyPageParams extends DefaultParams {
  currency: Currency;
}

interface TransparencyPageProps {
  params: Promise<TransparencyPageParams>;
}

export default async function Page({ params }: TransparencyPageProps) {
  const { lang, region, currency } = await params;

  return (
    <div className="-mt-24 md:-mt-36">
      <CurrencyRedirect currency={currency.toUpperCase() as WebsiteCurrency} />
      <HeroSection lang={lang} region={region} />
      <Resources lang={lang} region={region} currency={currency} />
      <SelectionProcess lang={lang} region={region} />
      <PastRounds lang={lang} region={region} />
      <SelectionFaq lang={lang} region={region} />
    </div>
  );
}
