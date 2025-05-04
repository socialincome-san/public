import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { BaseContainer } from '@socialincome/ui';
import { Contributors } from './(sections)/contributors';
import { HowItWorks } from './(sections)/how-it-works';
import { OurWork } from './(sections)/our-work';
import { Recipients } from './(sections)/recipients';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-our-work');
}

export default async function Page(props: DefaultPageProps) {
	const { lang, region } = await props.params;
	return (
		<BaseContainer className="space-y-56 pt-40">
			<OurWork lang={lang} region={region} />
			<HowItWorks lang={lang} region={region} />
			<Contributors lang={lang} region={region} />
			<Recipients lang={lang} region={region} />
		</BaseContainer>
	);
}
