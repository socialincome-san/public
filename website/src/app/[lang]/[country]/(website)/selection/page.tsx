import { DefaultPageProps } from '@/app/[lang]/[country]';
import { DrawCard, DrawDetail, DrawSummary } from '@/app/[lang]/[country]/(website)/selection/drawCard';
import { loadFutureDraws, loadPastDraws } from '@/app/[lang]/[country]/(website)/selection/state';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page(props: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: props.params.lang, namespaces: 'website-selection' });

	const futureDraws = await loadFutureDraws();
	const pastDraws = await loadPastDraws();

	return (
		<BaseContainer className="bg-base-blue min-h-screen">
			<IntroText
				translations={{
					readDraws: translator.t('read-draws'),
					readDraws2: translator.t('read-draws-2'),
					readDrawsLink: translator.t('read-draws-link'),
				}}
			/>

			<Typography as="h2" size="3xl">
				{translator.t('upcoming')}
			</Typography>

			{futureDraws.length === 0 && <Typography>{translator.t('none-scheduled')}</Typography>}

			<Typography>{translator.t('future-draws')}</Typography>
			{futureDraws.map((draw) => (
				<DrawCard
					key={draw.time}
					summary={
						<DrawSummary
							draw={draw}
							translations={{
								from: translator.t('from'),
							}}
						/>
					}
				/>
			))}

			<Typography as="h2" size="3xl">
				{translator.t('past')}
			</Typography>

			{pastDraws.length === 0 && <Typography>{translator.t('none-completed')}</Typography>}

			{pastDraws.map((draw) => (
				<DrawCard
					key={draw.time}
					summary={
						<DrawSummary
							draw={draw}
							translations={{
								from: translator.t('from'),
							}}
						/>
					}
					detail={
						<DrawDetail
							draw={draw}
							translations={{
								randomNumber: translator.t('random-number'),
								confirmGithub: translator.t('confirm-github'),
								confirmDrand: translator.t('confirm-drand'),
								people: translator.t('people'),
								longlist: translator.t('long-list', { context: { total: draw.total, count: draw.count } }),
							}}
						/>
					}
				/>
			))}
		</BaseContainer>
	);
}

type IntroTextProps = {
	translations: {
		readDraws: string;
		readDraws2: string;
		readDrawsLink: string;
	};
};

function IntroText({ translations }: IntroTextProps) {
	return (
		<div className="p-2">
			<Typography size="xl">
				{translations.readDraws}&nbsp;
				<a className="underline" href="https://some-blog-post.com">
					{translations.readDrawsLink}
				</a>
				&nbsp;
				{translations.readDraws2}
			</Typography>
		</div>
	);
}
