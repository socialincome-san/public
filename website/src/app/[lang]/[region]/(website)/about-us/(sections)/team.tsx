import { DefaultPageProps } from '@/app/[lang]/[region]';
import ajlaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/ajla.jpg';
import alexandreImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/alexandre.jpeg';
import andersImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/anders.jpeg';
import andrasImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/andras.jpeg';
import annalinaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/anna-lina.jpeg';
import anvitaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/anvita.jpeg';
import aurelieImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/aurelie.jpeg';
import carlosImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/carlos.jpeg';
import flavienImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/flavien.jpeg';
import juanImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/juan.jpeg';
import juliaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/julia.jpeg';
import kabeloImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/kabelo.jpeg';
import kerrinImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/kerrin.jpeg';
import larissaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/larissa.jpeg';
import lorenzoImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/lorenzo.jpg';
import mabelImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/mabel.jpeg';
import mariatuImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/mariatu.jpg';
import marionImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/marion.jpeg';
import michaelImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/michael.jpeg';
import mikolajImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/mikolaj.jpeg';
import patrikImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/patrik.jpeg';
import reneImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/rene.jpeg';
import riccardoImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/riccardo.jpg';
import sandinoImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/sandino.jpg';
import sarahImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/sarah.jpeg';
import sarveshImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/sarvesh.jpeg';
import simonImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/simon.jpeg';
import simoneImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/simone.jpeg';
import thomasImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/thomas.jpeg';
import verenaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/verena.jpeg';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, FontSize, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

type Group = {
	name: string;
	size: 'sm' | 'md' | 'lg';
	people: Person[];
};

type Person = {
	name: string;
	role: string;
	image: string | StaticImport;
};

const groups: Group[] = [
	{
		name: 'staff',
		size: 'md',
		people: [
			{ name: 'Mabel Turay', role: 'finance', image: mabelImage },
			{ name: 'Mariatu Haja Sesay', role: 'operations', image: mariatuImage },
		],
	},
	{
		name: 'volunteers',
		size: 'md',
		people: [
			{ name: 'Sandino Scheidegger', role: 'founder', image: sandinoImage },
			{ name: 'Kerrin Dieckmann', role: 'finance', image: kerrinImage },
			{ name: 'Aurélie Schmiedlin', role: 'communications', image: aurelieImage },
			{ name: 'Julia Bachmann', role: 'communications', image: juliaImage },
			{ name: 'Riccardo Tamburini', role: 'communications', image: riccardoImage },
			{ name: 'Michael Kündig', role: 'software-development', image: michaelImage },
			{ name: 'Mikołaj Demkow', role: 'app-development', image: mikolajImage },
			{ name: 'Verena Zaiser', role: 'app-development', image: verenaImage },
			{ name: 'András Heé', role: 'software-development', image: andrasImage },
			{ name: 'Carlos Badilla', role: 'impact-measurement', image: carlosImage },
		],
	},
	{
		name: 'board',
		size: 'md',
		people: [
			{ name: 'Kabelo Ruffo', role: 'co-president', image: kabeloImage },
			{ name: 'Flavien Meyer', role: 'co-president', image: flavienImage },
			{ name: 'Simone Huser', role: 'board-member', image: simoneImage },
			{ name: 'Anvita Pandey', role: 'board-member', image: anvitaImage },
			{ name: 'Marion Quartier', role: 'board-member', image: marionImage },
		],
	},

	{
		name: 'special-thanks',
		size: 'sm',
		people: [
			{ name: 'Juan Morales', role: 'software-development', image: juanImage },
			{ name: 'René Stalder', role: 'software-development', image: reneImage },
			{ name: 'Sarvesh Dwivedi', role: 'software-development', image: sarveshImage },
			{ name: 'Thomas Brenner', role: 'software-development', image: thomasImage },
			{ name: 'Alexandre Milan', role: 'software-development', image: alexandreImage },
			{ name: 'Patrik Sopran', role: 'app-development', image: patrikImage },
			{ name: 'Anders Nordhag', role: 'communications', image: andersImage },
			{ name: 'Larissa dos Santos Lima', role: 'communications', image: larissaImage },
			{ name: 'Ajla Murati', role: 'strategy', image: ajlaImage },
			{ name: 'Simon Bühler', role: 'communications', image: simonImage },
			{ name: 'Sarah Mekni', role: 'strategy', image: sarahImage },
			{ name: 'Lorenzo Garovi', role: 'strategy', image: lorenzoImage },
			{ name: 'Anna-Lina Müller', role: 'strategy', image: annalinaImage },
		],
	},
];
export default async function Team({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['countries', 'website-team'] });
	return (
		<BaseContainer id="team" className="py-8">
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('header')}
			</Typography>
			<Typography size="5xl" weight="bold" lineHeight="tight">
				{translator.t('title-1')}
				<Typography as="span" size="5xl" weight="bold" color="secondary" lineHeight="tight">
					{translator.t('title-2')}
				</Typography>
			</Typography>
			<div className="mt-16 space-y-20">
				{groups.map((group, index1) => (
					<div key={index1}>
						<Typography size="3xl" weight="bold">
							{translator.t(`groups.${group.name}.name`)}
						</Typography>
						<Typography size="md" className="mb-8">
							{translator.t(`groups.${group.name}.description`)}
						</Typography>
						<ul
							role="list"
							className={classNames(
								'grid lg:mx-0 lg:max-w-none',
								{
									'grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7': group.size === 'sm',
								},
								{
									'grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5': group.size === 'md',
								},
								{
									'grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4': group.size == 'lg',
								},
							)}
						>
							{group.people.map((person: Person, index2) => (
								<li key={index2} className="flex flex-col">
									<Image
										className="aspect-[5/6] w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
										src={person.image}
										alt={`${person.name} image`}
									/>
									<Typography as="h3" size={group.size} weight="semibold" lineHeight="tight" className="mt-6">
										{person.name}
									</Typography>
									<Typography
										color="muted-foreground"
										size={{ sm: 'xs', md: 'sm', lg: 'md' }[group.size] as FontSize}
										className="hyphens-auto break-words"
									>
										{translator.t(`roles.${person.role}`)}
									</Typography>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</BaseContainer>
	);
}
