import { DefaultPageProps } from '@/app/[lang]/[region]';
import { CheckIcon, ListBulletIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import classNames from 'classnames';

export async function WhatsNext({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-our-work'],
	});

	const timeline = [
		{
			title: translator.t('whats-next.timeline.item-1.title'),
			text: translator.t('whats-next.timeline.item-1.text'),
			Icon: CheckIcon,
			iconColor: 'text-green-500',
		},
		{
			title: translator.t('whats-next.timeline.item-2.title'),
			text: translator.t('whats-next.timeline.item-2.text'),
			Icon: CheckIcon,
			iconColor: 'text-green-500',
		},
		{
			title: translator.t('whats-next.timeline.item-3.title'),
			text: translator.t('whats-next.timeline.item-3.text'),
			Icon: CheckIcon,
			iconColor: 'text-green-500',
		},
		{
			title: translator.t('whats-next.timeline.item-4.title'),
			text: translator.t('whats-next.timeline.item-4.text'),
			Icon: ListBulletIcon,
			iconColor: 'text-secondary',
		},
	];

	return (
		<BaseContainer id="whats-next" className="flex flex-col justify-center space-y-8">
			<div className="space-y-4">
				<Typography as="h3" size="xl" color="muted-foreground">
					{translator.t('whats-next.header')}
				</Typography>
				<p className="mb-8 lg:mb-16">
					<Typography as="span" size="4xl" weight="bold">
						{translator.t('whats-next.title-1')}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" color="secondary">
						{translator.t('whats-next.title-2')}
					</Typography>
				</p>
				<Typography size="xl">{translator.t('whats-next.subtitle')}</Typography>
			</div>

			<ul role="list">
				{timeline.map(({ Icon, iconColor, title, text }, index) => (
					<li key={index}>
						<div className="relative mb-8">
							{index !== timeline.length - 1 ? (
								<span className="bg-muted-foreground absolute left-6 top-6 -ml-px h-full w-0.5" aria-hidden="true" />
							) : null}
							<div className="relative flex space-x-8">
								{Icon !== undefined ? (
									<div>
										<span className="bg-background ring-muted-foreground flex h-12 w-12 items-center justify-center rounded-full ring-8">
											<Icon className={classNames(iconColor, 'h-7 w-7')} aria-hidden="true" />
										</span>
									</div>
								) : (
									<div className="w-8" />
								)}
								<div className="flex flex-1 justify-between space-x-4">
									<div>
										<Typography size="xl" weight="bold">
											{title}
										</Typography>
										<Typography>{text}</Typography>
									</div>
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
		</BaseContainer>
	);
}
