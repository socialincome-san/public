import { DefaultPageProps } from '@/app/[lang]/[region]';
import Team from '@/app/[lang]/[region]/(website)/about-us/(sections)/team';
import Section1 from './(sections)/section-1';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<Section1 {...props} />
			<Team {...props} />
		</>
	);
}
