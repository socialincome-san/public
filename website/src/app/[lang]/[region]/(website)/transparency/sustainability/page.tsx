import { DefaultPageProps } from '@/app/[lang]/[region]';
import Section1 from './section-1';
import Section2 from './section-2';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<Section1 {...props} />
			<Section2 {...props} />
		</>
	);
}
