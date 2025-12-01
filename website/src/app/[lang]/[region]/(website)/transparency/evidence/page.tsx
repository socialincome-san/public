import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { BaseContainer } from '@socialincome/ui';
import Section1 from './section-1';
import Section2 from './section-2';
import Section3 from './section-3';
import { WebsiteLanguage } from '@/lib/i18n/utils';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang as WebsiteLanguage, 'website-evidence');
}

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	return (
		<BaseContainer>
			<Section1 lang={lang} region={region} />
			<Section2 lang={lang} region={region} />
			<Section3 lang={lang} region={region} />
		</BaseContainer>
	);
}
