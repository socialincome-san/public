import { COUNTRY_COOKIE } from '@/app/[lang]/[region]';
import { BlockWrapper } from '@/components/block-wrapper';
import { type CountryCode } from '@/generated/prisma/enums';
import { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import {
	loadCountryStatisticsComparison,
	type CountryStatisticFormat,
} from '@/lib/services/country/world-bank-country-statistics';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';
import { cn } from '@/lib/utils/cn';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { cookies, headers } from 'next/headers';
import NextImage from 'next/image';

type Props = {
	countryIsoCode: string;
	countryName: string;
	lang: WebsiteLanguage;
};

const formatStatisticValue = (value: number, format: CountryStatisticFormat, locale: string, yearsLabel: string): string => {
	switch (format) {
		case 'percentage':
			return `${formatNumberLocale(value, locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
		case 'years':
			return `${formatNumberLocale(value, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${yearsLabel}`;
		case 'number':
		default:
			return formatNumberLocale(value, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
	}
};

const normalizeCountryCode = (value: string | undefined): CountryCode | null => {
	const normalizedValue = value?.trim().toUpperCase();

	if (!normalizedValue || !isValidCountryCode(normalizedValue)) {
		return null;
	}

	return normalizedValue;
};

const FALLBACK_VISITOR_COUNTRY_CODE: CountryCode = 'CH';

const resolveVisitorCountryCode = async (): Promise<CountryCode> => {
	const cookieStore = await cookies();
	const countryFromCookie = normalizeCountryCode(cookieStore.get(COUNTRY_COOKIE)?.value);
	if (countryFromCookie) {
		return countryFromCookie;
	}

	const headerStore = await headers();
	const countryFromHeader = normalizeCountryCode(headerStore.get('cf-ipcountry') ?? undefined);
	if (countryFromHeader) {
		return countryFromHeader;
	}

	return FALLBACK_VISITOR_COUNTRY_CODE;
};

type CountryHeaderProps = {
	countryCode: CountryCode;
	countryName: string;
	align?: 'left' | 'right';
	nameClassName?: string;
};

const CountryHeader = ({ countryCode, countryName, align = 'left', nameClassName }: CountryHeaderProps) => {
	const alignmentClassName = align === 'right' ? 'items-end text-right' : 'items-start text-left';

	return (
		<div className={cn('flex flex-col gap-3', alignmentClassName)}>
			<NextImage
				src={`/assets/flags/${countryCode.toLowerCase()}.svg`}
				alt={`${countryCode} flag`}
				width={28}
				height={28}
				className="h-7 w-7 rounded-full object-cover"
			/>
			<div className="space-y-1">
				<p className={cn('text-primary leading-tight font-medium', nameClassName ?? 'text-2xl md:text-3xl')}>
					{countryName}
				</p>
			</div>
		</div>
	);
};

const MobileStatisticRow = ({ label, value, showLabel = true }: { label: string; value: string; showLabel?: boolean }) => {
	return (
		<div className="flex flex-col gap-0">
			<p
				className={cn('text-primary text-sm leading-5 font-bold', !showLabel && 'pointer-events-none invisible select-none')}
			>
				{label}
			</p>
			<p className="text-primary text-sm leading-5 font-normal">{value}</p>
		</div>
	);
};

export const CountryStatistics = async ({ countryIsoCode, countryName, lang }: Props) => {
	const normalizedCountryIsoCode = normalizeCountryCode(countryIsoCode);
	if (!normalizedCountryIsoCode) {
		return null;
	}

	const visitorCountryCode = await resolveVisitorCountryCode();
	const rows = await loadCountryStatisticsComparison(normalizedCountryIsoCode, visitorCountryCode);
	if (rows.length === 0) {
		return null;
	}

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const visitorCountryName = getCountryNameByCode(visitorCountryCode);
	const locale = getSafeNumberFormatLocale(lang);
	const yearsLabel = translator.t('countries-page.statistics.years');

	const formattedRows = rows.map((row) => ({
		...row,
		label: translator.t(row.labelKey),
		countryValue: formatStatisticValue(row.countryValue, row.format, locale, yearsLabel),
		visitorValue: formatStatisticValue(row.visitorValue, row.format, locale, yearsLabel),
	}));

	return (
		<BlockWrapper>
			<section className="mx-auto max-w-4xl">
				<div className="flex flex-col items-center gap-6">
					<h2 className="text-primary text-center text-3xl text-4xl leading-tight font-bold">
						{translator.t('countries-page.statistics.title')}
					</h2>
					<div className="border-border bg-background w-full overflow-hidden rounded-[calc(var(--radius)+4px)] border shadow-[0px_4px_28px_0px_rgba(0,30,101,0.07)]">
						<div className="lg:hidden">
							<div className="bg-accent relative overflow-hidden">
								<div className="bg-border absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2" aria-hidden="true" />
								<div className="grid grid-cols-2 items-stretch">
									<div className="bg-background rounded-l-[calc(var(--radius)+4px)] px-6 py-6">
										<CountryHeader
											countryCode={normalizedCountryIsoCode}
											countryName={countryName}
											nameClassName="text-[16px]"
										/>
										<div className="mt-8 flex flex-col gap-7">
											{formattedRows.map((row) => (
												<MobileStatisticRow key={row.key} label={row.label} value={row.countryValue} />
											))}
										</div>
									</div>
									<div className="bg-background px-6 py-6">
										<CountryHeader
											countryCode={visitorCountryCode}
											countryName={visitorCountryName}
											nameClassName="text-[16px]"
										/>
										<div className="mt-8 flex flex-col gap-7">
											{formattedRows.map((row) => (
												<MobileStatisticRow key={row.key} label={row.label} value={row.visitorValue} showLabel={false} />
											))}
										</div>
									</div>
								</div>
								<div className="bg-muted text-muted-foreground absolute top-16 left-1/2 z-20 flex size-5 -translate-x-1/2 items-center justify-center rounded-full text-[8px] font-bold uppercase">
									{translator.t('countries-page.statistics.vs')}
								</div>
							</div>
						</div>

						<div className="hidden lg:block">
							<div className="bg-accent relative overflow-hidden">
								<div
									className="bg-border absolute inset-y-0 left-[calc(50%+160px)] z-10 w-px -translate-x-1/2"
									aria-hidden="true"
								/>
								<div className="grid grid-cols-[320px_minmax(0,1fr)_minmax(0,1fr)] items-stretch">
									<div className="bg-accent p-12">
										<div className="pointer-events-none invisible select-none">
											<CountryHeader
												countryCode={normalizedCountryIsoCode}
												countryName={countryName}
												nameClassName="text-2xl font-medium"
											/>
										</div>
										<div className="mt-8 flex flex-col gap-4">
											{formattedRows.map((row) => (
												<p key={row.key} className="text-primary text-base leading-6 font-bold">
													{row.label}
												</p>
											))}
										</div>
									</div>
									<div className="border-border bg-background rounded-l-[calc(var(--radius)+4px)] border-l p-12">
										<CountryHeader
											countryCode={normalizedCountryIsoCode}
											countryName={countryName}
											nameClassName="text-2xl font-medium"
										/>
										<div className="mt-8 flex flex-col gap-4">
											{formattedRows.map((row) => (
												<p key={row.key} className="text-primary text-base leading-6 font-normal">
													{row.countryValue}
												</p>
											))}
										</div>
									</div>
									<div className="bg-background p-12">
										<CountryHeader
											countryCode={visitorCountryCode}
											countryName={visitorCountryName}
											nameClassName="text-2xl font-medium"
										/>
										<div className="mt-8 flex flex-col gap-4">
											{formattedRows.map((row) => (
												<p key={row.key} className="text-primary text-base leading-6 font-normal">
													{row.visitorValue}
												</p>
											))}
										</div>
									</div>
								</div>
								<div className="text-muted-foreground bg-muted absolute top-20 left-[calc(50%+160px)] z-20 flex size-10 -translate-x-1/2 items-center justify-center rounded-full text-xs font-normal uppercase">
									{translator.t('countries-page.statistics.vs')}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</BlockWrapper>
	);
};
