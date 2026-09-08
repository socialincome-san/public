'use client';

import { FinancialInstitutionLogo, type FinancialInstitutionLogoId } from '@/components/reserves/financial-institution-logo';
import { useCountUp } from '@/lib/hooks/use-count-up';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { useInView } from 'motion/react';
import { useRef } from 'react';

export type FinancialInstitution = {
	id: FinancialInstitutionLogoId;
	label: string;
};

type Props = {
	amount: number;
	title: string;
	titleCurrency: string;
	institutionsHeading: string;
	institutions: FinancialInstitution[];
	lang: WebsiteLanguage;
};

export const ReservesTotal = ({ amount, title, titleCurrency, institutionsHeading, institutions, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
	const animatedValue = useCountUp(amount, isInView);
	const displayValue = isInView ? animatedValue : amount;

	return (
		<div ref={sectionRef} className="text-foreground flex flex-col gap-8">
			<div className="flex flex-col gap-6">
				<p className="text-lg leading-tight font-bold">
					{title} <span className="text-sm font-normal">{titleCurrency}</span>
				</p>
				<p className="block text-7xl leading-none font-light tracking-normal md:text-8xl lg:text-[112px]">
					{formatNumberLocale(Math.round(displayValue), locale, { maximumFractionDigits: 0 })}
				</p>
			</div>

			<div className="flex flex-col gap-4">
				<p className="text-base leading-6 font-medium">{institutionsHeading}</p>
				<ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
					{institutions.map(({ id, label }) => (
						<li key={id}>
							<FinancialInstitutionLogo id={id} label={label} />
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
