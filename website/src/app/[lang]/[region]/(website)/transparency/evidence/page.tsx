import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { BaseContainer } from '@socialincome/ui';
import Section1 from './section-1';
import Section2 from './section-2';
import Section3 from './section-3';

export async function generateMetadata({ params }: DefaultPageProps) {
	return getMetadata(params.lang, 'website-evidence');
}

export default async function Page(props: DefaultPageProps) {
	return (
		<BaseContainer>
			<Section1 {...props} />
			<Section2 {...props} />
			<Section3 {...props} />
		</BaseContainer>
	);
}
