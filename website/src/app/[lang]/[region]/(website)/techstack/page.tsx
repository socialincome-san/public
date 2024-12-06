import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Hero } from './(sections)/hero';
import { TechList } from './(sections)/techlist';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	return (
		<div className="space-y-24">
			<Hero lang={lang} region={region} />
			<TechList lang={lang} region={region} />
		</div>
	);
}