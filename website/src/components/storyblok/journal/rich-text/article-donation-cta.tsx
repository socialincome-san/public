import { MakeDonationForm } from '@/components/make-donation-form';
import type { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	lang: WebsiteLanguage;
};

export const ArticleDonationCta = ({ lang }: Props) => (
	<div className="my-10">
		<MakeDonationForm lang={lang} />
	</div>
);
