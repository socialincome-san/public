import { DefaultPageProps } from '@/app/[lang]/[region]';
import { OpenSourceContributors } from './(sections)/avatars';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	return (
		<div className="space-y-24">
			<OpenSourceContributors lang={lang} region={region} />
		</div>
	);
}