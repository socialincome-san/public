import { DefaultPageProps } from '@/app/[lang]/[country]';
import { SectionContributors } from './section-contributors';
import { SectionHowItWorks } from './section-how-it-works';
import { SectionOurWork } from './section-our-work';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<SectionOurWork {...props} />
			<SectionHowItWorks {...props} />
			<SectionContributors {...props} />
		</>
	);
}
