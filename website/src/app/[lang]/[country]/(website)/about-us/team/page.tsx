import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import alexandreImage from './(assets)/alexandre.jpeg';
import andersImage from './(assets)/anders.jpeg';
import andrasImage from './(assets)/andras.jpeg';
import anvitaImage from './(assets)/anvita.jpeg';
import aurelieImage from './(assets)/aurelie.jpeg';
import carlosImage from './(assets)/carlos.jpeg';
import flavienImage from './(assets)/flavien.jpeg';
import juanImage from './(assets)/juan.jpeg';
import juliaImage from './(assets)/julia.jpeg';
import kabeloImage from './(assets)/kabelo.jpeg';
import kerrinImage from './(assets)/kerrin.jpeg';
import larissaImage from './(assets)/larissa.jpeg';
import mabelImage from './(assets)/mabel.jpeg';
import mariatuImage from './(assets)/mariatu.jpg';
import marionImage from './(assets)/marion.jpeg';
import michaelImage from './(assets)/michael.jpeg';
import mikolajImage from './(assets)/mikolaj.jpeg';
import reneImage from './(assets)/rene.jpeg';
import riccardoImage from './(assets)/riccardo.jpg';
import sandinoImage from './(assets)/sandino.jpg';
import sarveshImage from './(assets)/sarvesh.jpeg';
import simoneImage from './(assets)/simone.jpeg';
import thomasImage from './(assets)/thomas.jpeg';
import verenaImage from './(assets)/verena.jpeg';

type Person = {
	name: string;
	role: string;
	location?: string;
	image: string | StaticImport;
};

const groups: { name: string; people: Person[] }[] = [
	{
		name: 'staff',
		people: [
			{ name: 'Mabel Turay', role: 'finance', location: 'SL', image: mabelImage },
			{ name: 'Mariatu Haja Sesay', role: 'operations', location: 'SL', image: mariatuImage },
		],
	},
	{
		name: 'board',
		people: [
			{ name: 'Kabelo Ruffo', role: 'co-president', image: kabeloImage },
			{ name: 'Simone Huser', role: 'co-president', image: simoneImage },
			{ name: 'Anvita Pandey', role: 'board-member', image: anvitaImage },
			{ name: 'Flavien Meyer', role: 'board-member', image: flavienImage },
			{ name: 'Marion Quartier', role: 'board-member', image: marionImage },
		],
	},
	{
		name: 'volunteers',
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
		name: 'special-thanks',
		people: [
			{ name: 'Juan Morales', role: 'software-development', image: juanImage },
			{ name: 'René Stalder', role: 'software-development', image: reneImage },
			{ name: 'Sarvesh Dwivedi', role: 'software-development', image: sarveshImage },
			{ name: 'Thomas Brenner', role: 'software-development', image: thomasImage },
			{ name: 'Alexandre Milan', role: 'software-development', image: alexandreImage },
			{ name: 'Anders Nordhag', role: 'communications', image: andersImage },
			{ name: 'Larissa dos Santos Lima', role: 'communications', image: larissaImage },
		],
	},
];
export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['countries', 'website-team'] });
	return (
		<BaseContainer className="py-8">
			<Typography as="h3" size="xl" color="muted-foreground" className="mb-4">
				{translator.t('header')}
			</Typography>
			<Typography size="5xl" weight="bold" lineHeight="tight">
				{translator.t('title-1')}
				<Typography as="span" size="5xl" weight="bold" color="secondary" lineHeight="tight">
					{translator.t('title-2')}
				</Typography>
			</Typography>
			<div className="mt-16 space-y-12">
				{groups.map((group, index1) => (
					<div key={index1}>
						<Typography size="3xl" weight="bold" className="mb-4">
							{translator.t(`groups.${group.name}`)}
						</Typography>
						<ul
							role="list"
							className={classNames(
								'grid max-w-2xl grid-cols-2  lg:mx-0 lg:max-w-none ',
								{
									'grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6':
										group.name === 'special-thanks',
								},
								{ 'gap-x-8 gap-y-14 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': group.name !== 'special-thanks' },
							)}
						>
							{group.people.map((person: Person, index2) => (
								<li key={index2}>
									<Image
										className="aspect-[5/6] w-full rounded-2xl object-cover"
										src={person.image}
										alt={`${person.name} image`}
									/>
									<Typography
										as="h3"
										size={group.name === 'special-thanks' ? 'sm' : 'lg'}
										weight="semibold"
										lineHeight="tight"
										className="mt-6"
									>
										{person.name}
									</Typography>
									<Typography color="muted-foreground" size={group.name === 'special-thanks' ? 'sm' : 'md'}>
										{translator.t(`roles.${person.role}`)}
									</Typography>
									{person.location && <Typography size="sm">{translator.t(person.location)}</Typography>}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</BaseContainer>
	);
}
