import { DefaultPageProps } from '@/app/[lang]/[country]';
import Section1 from './section-1';
import Section2 from './section-2';
import Section3 from './section-3';
import Section4 from './section-4';
import Section5 from './section-5';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<Section1 {...props} />
			<Section2 {...props} />
			<Section3 {...props} />
			<Section4 {...props} />
			<Section5 {...props} />
		</>
	);
}
