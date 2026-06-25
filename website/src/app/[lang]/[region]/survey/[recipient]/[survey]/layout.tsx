import { DefaultParams } from '@/app/[lang]/[region]';
import { type PropsWithChildren } from 'react';

type SurveyPageParams = {
	recipient: string;
	survey: string;
} & DefaultParams;

export type SurveyPageProps = {
	params: Promise<SurveyPageParams>;
};

export default function Layout({ children }: PropsWithChildren<SurveyPageProps>) {
	return (
		<section className="w-site-width max-w-content mx-auto px-4 py-6 sm:py-10 lg:py-14">
			<div className="bg-card/95 ring-foreground/5 overflow-hidden rounded-[2rem] shadow-[0_24px_80px_rgba(31,65,101,0.12)] ring-1 backdrop-blur">
				<div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10">{children}</div>
			</div>
		</section>
	);
}
