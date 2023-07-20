import { DefaultPageProps } from '@/app/[lang]/[country]';
import Section1 from './section-1';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<Section1 {...props} />
		</>
	);
}
