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
	return (
		<BaseContainer className="space-y-56 pt-40">
			<OurWork /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
			<HowItWorks /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
			<Contributors /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
			<Recipients /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
		</BaseContainer>
	);
}
