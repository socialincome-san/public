import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { BaseContainer } from '@socialincome/ui';
import Section1 from './section-1';
import Section2 from './section-2';
import Section3 from './section-3';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-evidence');
}

export default async function Page(props: DefaultPageProps) {
	return (
		<BaseContainer>
			<Section1 /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
			<Section2 /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
			<Section3 /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
		</BaseContainer>
	);
}
