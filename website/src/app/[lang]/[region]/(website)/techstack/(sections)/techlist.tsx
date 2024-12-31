'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import TechCard from '@/app/[lang]/[region]/(website)/techstack/(sections)/techcard';
import { SpinnerIcon } from '@/components/logos/spinner-icon';
import { useTranslator } from '@/hooks/useTranslator';
import { Tabs, TabsList, TabsTrigger } from '@socialincome/ui';
import { useState } from 'react';

type TechEntryJSON = {
	title: string;
	description: string;
	link: string;
	logo: string;
	donated: boolean;
};

export function TechList({ lang }: DefaultParams) {
	const [isDonated, setIsDonated] = useState(false);

	const translator = useTranslator(lang, 'website-techstack');
	const techArray: TechEntryJSON[] | undefined = translator?.t('cards');

	const handleTabChange = (value: string) => {
		setIsDonated(value === 'donated');
	};

	if (!translator || !techArray) {
		return (
			<div className="mx-auto max-w-6xl">
				<div className="flex justify-center pb-10">
					<SpinnerIcon />
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl">
			<div className="flex justify-center pb-10">
				<Tabs defaultValue="tech" className="w-[400px]" onValueChange={handleTabChange}>
					<TabsList className="bg-primary grid w-full grid-cols-2 bg-opacity-10">
						<TabsTrigger value="tech">{translator?.t('tabs.tech-stack')}</TabsTrigger>
						<TabsTrigger value="donated">{translator?.t('tabs.donated-tech')}</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
				{techArray
					.filter((t) => !isDonated || t.donated)
					.map((techEntry, index) => (
						<TechCard
							{...techEntry}
							translations={{ badgeDonated: translator.t('badges.donated') || '' }}
							key={index}
						/>
					))}
			</div>
		</div>
	);
}
