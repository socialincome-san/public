import { DefaultPageProps } from '@/app/[lang]/[region]';
import Section1 from './section-1';
import Section2 from './section-2';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<Section1 /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
			<Section2 /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
				{...props}
			/>
		</>
	);
}
