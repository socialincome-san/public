import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-books'],
	});

	return (
		<BaseContainer className="mt-20 flex flex-col content-center justify-center text-center">
			<Typography size="4xl" weight="bold" lineHeight="loose" className="m-3 w-auto pb-4">
				{translator.t('section-1.title')}
			</Typography>
			<Typography as="p" size="xl" weight="normal" lineHeight="relaxed" className="m-auto w-4/5 px-1 pb-3 sm:w-3/5">
				{translator.t('section-1.subtitle-1')}
			</Typography>
			<Typography as="p" size="xl" weight="normal" lineHeight="relaxed" className="m-auto w-4/5 pb-3 sm:w-3/5">
				{translator.t('section-1.subtitle-2')} <br />
				<Link href="mailto: hello@socialincome.org" className="text-blue-500 hover:text-blue-700">
					{translator.t('section-1.subtitle-3')}
				</Link>
				.
			</Typography>
			<div className=" flex justify-center text-center align-middle ">
				<svg xmlns="http://www.w3.org/2000/svg" height="0.8em" viewBox="0 0 512 512">
					<path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
				</svg>
				<span className="px-2  text-xs text-zinc-400">{translator.t('section-1.lastUpdate')}</span>
			</div>
		</BaseContainer>
	);
}
