import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Contributors } from './(sections)/contributors';
import { HowItWorks } from './(sections)/how-it-works';
import { OurWork } from './(sections)/our-work';
import { Recipients } from './(sections)/recipients';
import { WhatsNext } from './(sections)/whats-next';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<OurWork {...props} />
			<HowItWorks {...props} />
			<Contributors {...props} />
			<Recipients {...props} />
			<WhatsNext {...props} />
		</>
	);
}
