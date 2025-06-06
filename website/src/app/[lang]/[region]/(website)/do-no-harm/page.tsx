import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, Card, CardContent, linkCn } from '@socialincome/ui';
import Link from 'next/link';
import Image from 'next/image';
import Playstore from '@/app/[lang]/[region]/(website)/app/(assets)/playstore.svg';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-do-no-harm'] });

	return (
		<BaseContainer className="items-start flex flex-col space-y-8 pt-16">
			<div className="text-2xl font-bold">1. Understanding Social Context, Actors & Stakeholders</div>

			<Card className="w-full p-6">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Best Practice Principle */}
					<div className="w-full md:w-1/2 space-y-2">
						<p className="text-sm ">Best Practice Principle</p>
						<p className="text-lg ">
							Identify and understand key actors (recipients, families, friends, community).
						</p>
					</div>

					{/* Social Income Application */}
					<div className="w-full md:w-1/2 space-y-2">
						<p className="text-sm  ">How Social Income Applies It</p>
						<p className="text-lg ">
							Social Income works with local NGOs and local employees to understand the role of money.
						</p>
					</div>
				</div>
			</Card>

			<Card className="w-full p-6">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Best Practice Principle */}
					<div className="w-full md:w-1/2 space-y-3">
						<div className="space-y-1">
							<p className="text-sm muted-foreground">
								<Typography color="secondary">Best Practice Principle</Typography>
								</p>
							<p className="text-lg">
								Assess and understand previous conflict lines: what are the dividers and tensions in the larger context and specific community.
							</p>
						</div>
					</div>

					{/* Social Income Application */}
					<div className="w-full md:w-1/2 space-y-3">
						<div className="space-y-1">
							<p>
								<Typography size="sm" color="secondary">How Social Income Applies It</Typography>
							</p>
							<p className="text-lg">
								Social Income engages in post-conflict settings and is knowledgeable about previous societal fault lines and conflict in the community by engaging in close contact with local staff and recipients.
							</p>
						</div>

						{/* Reference Links */}
						<div className="mt-2 space-x-3">
							<a href="#" className={linkCn({
								arrow: 'external',
								underline: 'none'
							})}>
								Local partners
							</a>
							<a href="#" className={linkCn({
								arrow: 'external',
								underline: 'none'
							})}>
								Local employees
							</a>
						</div>
					</div>
				</div>
			</Card>

			{/* Row 2 */}
			<div className="w-full flex flex-col md:flex-row border p-4 rounded-lg gap-4">
				<div className="w-full md:w-1/2  p-2">Div A - Row 2</div>
				<div className="w-full md:w-1/2  p-2">Div Info - Row 2</div>
			</div>

			{/* Row 3 with links */}
			<div className="w-full flex flex-col md:flex-row border p-4 rounded-lg gap-4">
				<div className="w-full md:w-1/2  p-2">Div A - Row 3</div>
				<div className="w-full md:w-1/2  p-2">
					Div Info - Row 3
					<div className="mt-2 space-x-2">
						<a href="#" className="text-blue-600 underline">Link 1</a>
						<a href="#" className="text-blue-600 underline">Link 2</a>
					</div>
				</div>
			</div>

			{/* Continue for Rows 4 to 10 similarly... */}
		</BaseContainer>
	);
}
