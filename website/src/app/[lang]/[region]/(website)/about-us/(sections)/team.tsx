import ajlaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/ajla.jpg';
import alexandraImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/alexandra-andrist.jpg';
import alexandreImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/alexandre.jpeg';
import alexeyImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/alexey-shestakov.jpeg';
import andersImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/anders.jpeg';
import andrasImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/andras.jpeg';
import annalinaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/anna-lina.jpeg';
import arieaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/ariea-burke.jpg';
import aurelieImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/aurelie.jpeg';
import carlosImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/carlos.jpeg';
import fabioImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/fabio-hurni.jpg';
import fabriceImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/fabrice-michaud.jpg';
import flavienImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/flavien.jpeg';
import francoiseImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/francoise.jpg';
import gavriilImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/gavriil-tzortzakis.jpg';
import innaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/inna-abdrakhmanova.jpeg';
import jessicaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/jessica-freeman.jpg';
import juanImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/juan.jpeg';
import juliaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/julia.jpeg';
import kabeloImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/kabelo.jpeg';
import karinImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/karin-berg.jpg';
import katalinImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/katalin-holanyi.jpeg';
import kerrinImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/kerrin.jpeg';
import larissaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/larissa.jpeg';
import leaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/lea-strohm.jpeg';
import lorenzoImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/lorenzo.jpg';
import mabelImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/mabel.jpeg';
import marcImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/marc-werner.jpg';
import marcoImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/marco-bohler.jpeg';
import mariatuImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/mariatu.jpg';
import marionImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/marion.jpeg';
import mathildeImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/mathilde-dumont.jpg';
import matthewImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/matthew.jpeg';
import michaelImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/michael.jpeg';
import mikolajImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/mikolaj.jpeg';
import ninaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/nina-limacher.jpeg';
import patrickImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/patrick-mcclurg.jpeg';
import patrikImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/patrik.jpeg';
import pranavImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/pranav.jpg';
import raphaelImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/raphael-wirth.jpeg';
import reneImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/rene.jpeg';
import riccardoImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/riccardo.jpg';
import sandinoImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/sandino.jpg';
import sarahImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/sarah.jpeg';
import sarveshImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/sarvesh.jpeg';
import simonImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/simon.jpeg';
import simoneImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/simone.jpeg';
import thomasImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/thomas.jpeg';
import verenaImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/verena.jpeg';
import willemijnImage from '@/app/[lang]/[region]/(website)/about-us/(assets)/willemijn-de-gaay-fortman.jpeg';

import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, FontColor, FontSize, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import _ from 'lodash';
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
			{ name: 'Julia Bachmann', role: 'socialmedia', image: juliaImage },
			{ name: 'Riccardo Tamburini', role: 'communications', image: riccardoImage },
			{ name: 'Michael Kündig', role: 'software-development', image: michaelImage },
			{ name: 'Mikołaj Demkow', role: 'app-development', image: mikolajImage },
			{ name: 'Verena Zaiser', role: 'app-development', image: verenaImage },
			{ name: 'Matthew Roberts', role: 'communications', image: matthewImage },
			{ name: 'Karin Berg', role: 'app-development', image: karinImage },
			{ name: 'Marc Werner', role: 'research', image: marcImage },
			{ name: 'Gavriil Tzortzakis', role: 'software-development', image: gavriilImage },
			{ name: 'Patrick McClurg', role: 'software-development', image: patrickImage },
			{ name: 'Willemijn de Gaay Fortman', role: 'strategy', image: willemijnImage },
			{ name: 'Lea Strohm', role: 'strategy', image: leaImage },
			{ name: 'Raphael Wirth', role: 'software-development', image: raphaelImage },
			{ name: 'Jessica Freeman', role: 'fundraising', image: jessicaImage },
			{ name: 'Alexandra Andrist', role: 'editorial', image: alexandraImage },
			{ name: 'Ariea Burke', role: 'editorial', image: arieaImage },
			{ name: 'Fabrice Michaud', role: 'software-development', image: fabriceImage },
		],
	},
	{
		name: 'board',
		size: 'md',
		people: [
			{ name: 'Kabelo Ruffo', role: 'board-member', image: kabeloImage },
			{ name: 'Flavien Meyer', role: 'co-president', image: flavienImage },
			{ name: 'Fabio Hurni', role: 'board-member', image: fabioImage },
			{ name: 'Nina Limacher', role: 'co-president', image: ninaImage },
			{ name: 'Marion Quartier', role: 'board-member', image: marionImage },
		],
	},

	{
		name: 'special-thanks',
		size: 'sm',
		people: [
			{ name: 'Juan Morales', role: 'software-development', image: juanImage },
			{ name: 'Alexandre Milan', role: 'software-development', image: alexandreImage },
			{ name: 'Patrik Sopran', role: 'app-development', image: patrikImage },
			{ name: 'Anders Nordhag', role: 'communications', image: andersImage },
			{ name: 'Ajla Murati', role: 'operations', image: ajlaImage },
			{ name: 'Sarah Mekni', role: 'strategy', image: sarahImage },
			{ name: 'Lorenzo Garovi', role: 'strategy', image: lorenzoImage },
			{ name: 'Anna-Lina Müller', role: 'strategy', image: annalinaImage },
			{ name: 'Simon Bühler', role: 'communications', image: simonImage },
			{ name: 'René Stalder', role: 'software-development', image: reneImage },
			{ name: 'Sarvesh Dwivedi', role: 'software-development', image: sarveshImage },
			{ name: 'Carlos Badilla', role: 'fundraising', image: carlosImage },
			{ name: 'Larissa dos Santos Lima', role: 'fundraising', image: larissaImage },
			{ name: 'András Heé', role: 'software-development', image: andrasImage },
			{ name: 'Thomas Brenner', role: 'software-development', image: thomasImage },
			{ name: 'Mathilde Dumond', role: 'software-development', image: mathildeImage },
			{ name: 'Inna Abdrakhmanova', role: 'software-development', image: innaImage },
			{ name: 'Alexey Shestakov', role: 'software-development', image: alexeyImage },
			{ name: 'Françoise Légeret', role: 'translations', image: francoiseImage },
			{ name: 'Marco Bohler', role: 'software-development', image: marcoImage },
			{ name: 'Katalin Holanyi', role: 'design', image: katalinImage },
			{ name: 'Pranav Chatur', role: 'software-development', image: pranavImage },
			{ name: 'Simone Huser', role: 'board-member', image: simoneImage },
		],
	},
];

export default async function Team({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['countries', 'website-about-us'],
	});
	return (
		<BaseContainer id="team" className="scroll-mt-36">
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('team.header')}
			</Typography>
			<Typography size="4xl" weight="bold">
				{translator.t<{ text: string; color?: FontColor }[]>('team.title').map((title, index) => (
					<Typography as="span" key={index} color={title.color}>
						{title.text}
					</Typography>
				))}
			</Typography>
			<div className="mt-10 space-y-16">
				{groups.map((group, index1) => (
					<div key={index1}>
						<Typography size="3xl" weight="bold" className="py-8">
							{translator.t(`team.groups.${group.name}.name`)}
						</Typography>
						<div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-16">
							<Typography size="xl" weight="medium">
								{translator.t(`team.groups.${group.name}.subtitle`)}
							</Typography>
							<div className="md:col-span-2">
								<Typography size="lg" className="mb-8 [&_a]:underline"
									dangerouslySetInnerHTML={{
										__html: translator.t(`team.groups.${group.name}.description`),
									}}
								/>
							</div>
						</div>
						<ul
							role="list"
							className={classNames(
								'grid pt-6 lg:mx-0 lg:max-w-none',
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
							{_.sortBy(group.people, 'name').map((person: Person, index2) => (
								<li key={index2} className="flex flex-col">
									<Image
										className="aspect-5/6 w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
										src={person.image}
										alt={`${person.name} image`}
									/>
									<Typography as="h3" size={group.size} weight="medium" lineHeight="tight" className="mt-6">
										{person.name}
									</Typography>
									<Typography
										color="muted-foreground"
										size={{ sm: 'xs', md: 'sm', lg: 'md' }[group.size] as FontSize}
										className="wrap-break-word hyphens-auto"
									>
										{translator.t(`team.roles.${person.role}`)}
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
