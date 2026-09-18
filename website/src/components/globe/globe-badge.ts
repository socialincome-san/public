import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import { formatCurrencyLocale, formatDateLocale } from '@/lib/utils/string-utils';

const buildBadgeContent = (contribution: GlobeContribution, locale: string): HTMLElement => {
	const formattedAmount = formatCurrencyLocale(contribution.amount, contribution.currency, locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});

	const formattedDate = formatDateLocale(new Date(contribution.contributedAt), locale, {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});

	const badge = document.createElement('div');
	badge.dataset.globeBadge = 'true';
	badge.className =
		'flex w-max flex-col items-start gap-0.5 whitespace-nowrap rounded-md bg-white px-3 py-2 text-left shadow-md';

	const countryRow = document.createElement('span');
	countryRow.className = 'inline-flex items-center gap-1';

	const flag = document.createElement('img');
	flag.src = `/assets/flags/${contribution.countryCode.toLowerCase()}.svg`;
	flag.alt = '';
	flag.width = 14;
	flag.height = 14;
	flag.className = 'size-[14px] shrink-0 rounded-full object-cover';

	const countryLabel = document.createElement('span');
	countryLabel.className = 'text-muted-foreground text-[9px] font-medium uppercase tracking-[0.05em]';
	countryLabel.textContent = contribution.countryName;

	countryRow.append(countryLabel, flag);

	const meta = document.createElement('span');
	meta.className = 'text-foreground text-[10px] font-bold';
	meta.textContent = `${formattedDate} · ${formattedAmount}`;

	badge.append(countryRow, meta);

	return badge;
};

export const createBadgeSlotElement = (): HTMLElement => {
	const slot = document.createElement('div');
	slot.className = 'pointer-events-none';
	slot.style.transform = 'translateY(-10px)';
	slot.style.display = 'none';

	return slot;
};

export const mountBadgeContent = (slot: HTMLElement, contribution: GlobeContribution, locale: string, animate = true) => {
	slot.replaceChildren(buildBadgeContent(contribution, locale));
	slot.style.display = '';
	slot.style.opacity = animate ? '' : '1';
	slot.classList.remove('animate-globe-badge');

	if (animate) {
		void slot.offsetWidth;
		slot.classList.add('animate-globe-badge');
	}
};

export const clearBadgeSlot = (slot: HTMLElement) => {
	slot.replaceChildren();
	slot.classList.remove('animate-globe-badge');
	slot.style.display = 'none';
	slot.style.opacity = '';
};
