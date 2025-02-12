'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useTranslator } from '@/hooks/useTranslator';
import { Badge, BaseContainer, Button, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useIntersectionObserver } from 'usehooks-ts';

type BoxProps = {
	active: boolean;
	title?: string;
	subtitle?: string;
	number?: number;
	onClick: () => void;
};

function Box({ active, number, title, subtitle, onClick }: BoxProps) {
	return (
		<button
			onClick={onClick}
			className={classNames('border-primary group flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4', {
				'bg-primary': active,
				'hover:bg-primary hover:text-popover-foreground': !active,
			})}
		>
			<div
				className={classNames(
					'bg-primary flex h-8 w-8 items-center justify-center rounded-full bg-opacity-10 text-lg',
					{
						'text-primary bg-white bg-opacity-100': active,
						'text-primary group-hover:bg-white': !active,
					},
				)}
			>
				{number}
			</div>
			<div className="text-left">
				<Typography
					weight="medium"
					size="xl"
					className={classNames('mb-2', {
						'text-accent': active,
						'text-accent group-hover:text-accent': !active,
					})}
				>
					{title}
				</Typography>
				<Typography
					size="xl"
					className={classNames({
						'text-white': active,
						'group-hover:text-white': !active,
					})}
				>
					{subtitle}
				</Typography>
			</div>
		</button>
	);
}

export function SelectionProcess({ lang }: DefaultParams) {
	const translator = useTranslator(lang, 'website-selection');
	const [activeBox, setActiveBox] = useState<'preselection' | 'selection'>('preselection');
	const { ref, isIntersecting, entry } = useIntersectionObserver({ threshold: 0.2 });

	useEffect(() => {
		// if only 20% (threshold) of the box is visible, and the top of the box is above the viewport,
		// set the active box to selection
		if (!isIntersecting && entry && entry.boundingClientRect.top < 0) {
			setActiveBox('selection');
		} else {
			setActiveBox('preselection');
		}
	}, [isIntersecting, entry?.boundingClientRect.bottom, entry?.boundingClientRect.top]);

	return (
		<BaseContainer id="selection-process-section" className="mt-36 scroll-mt-36">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
				<div className="flex h-fit flex-col gap-4 md:sticky md:top-36">
					<Box
						active={activeBox === 'preselection'}
						number={1}
						title={translator?.t('section-3.preselection-title')}
						subtitle={translator?.t('section-3.preselection-subtitle')}
						onClick={() => {
							document.getElementById('preselection-section')?.scrollIntoView({ behavior: 'smooth' });
							setActiveBox('preselection');
						}}
					/>
					<Box
						active={activeBox === 'selection'}
						number={2}
						title={translator?.t('section-3.selection-title')}
						subtitle={translator?.t('section-3.selection-subtitle')}
						onClick={() => {
							document.getElementById('selection-section')?.scrollIntoView({ behavior: 'smooth' });
							setActiveBox('selection');
						}}
					/>
				</div>
				<div className="space-y-16">
					<div id="preselection-section" ref={ref} className="scroll-mt-36">
						<Typography weight="medium" className="mb-4 text-3xl sm:text-4xl md:text-4xl">
							{translator?.t('section-3.preselection-title')}
						</Typography>
						<Typography className="mb-4 text-xl">{translator?.t('section-3.preselection-desc')}</Typography>
						<div className="mb-6 flex items-center space-x-2">
							<Badge size="md">
								<Typography weight="normal">{translator?.t('section-3.goal')}</Typography>
							</Badge>
							<Typography className="text-md">{translator?.t('section-3.preselection-goal')}</Typography>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator?.t('section-3.preselection-1-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator?.t('section-3.preselection-1-desc')}</Typography>
							<Typography className="text-md mb-6">{translator?.t('section-3.preselection-1-annex')}</Typography>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator?.t('section-3.preselection-2-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator?.t('section-3.preselection-2-desc')}</Typography>
							<Typography className="text-md mb-6">{translator?.t('section-3.preselection-2-annex')}</Typography>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator?.t('section-3.preselection-3-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator?.t('section-3.preselection-3-desc')}</Typography>
							<Typography className="text-md mb-6">{translator?.t('section-3.preselection-3-annex')}</Typography>
						</div>
					</div>

					<div id="selection-section" className="scroll-mt-36">
						<Typography weight="medium" className="mb-4 text-3xl sm:text-4xl md:text-4xl">
							{translator?.t('section-3.selection-title')}
						</Typography>
						<Typography className="mb-4 text-xl">{translator?.t('section-3.selection-desc')}</Typography>
						<div className="mb-6 flex items-center space-x-2">
							<Badge size="md">
								<Typography weight="normal">{translator?.t('section-3.goal')}</Typography>
							</Badge>
							<Typography className="text-md">{translator?.t('section-3.selection-goal')}</Typography>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator?.t('section-3.selection-1-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator?.t('section-3.selection-1-desc')}</Typography>
							<Typography className="text-md mb-6">{translator?.t('section-3.selection-1-annex')}</Typography>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator?.t('section-3.selection-2-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator?.t('section-3.selection-2-desc')}</Typography>
							<Button variant="link" className="text-md">
								<Link href="https://api.drand.sh/public/latest" target="_blank" rel="noopener noreferrer">
									<Typography className="mb-6">{translator?.t('section-3.selection-2-annex')}</Typography>
								</Link>
							</Button>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator?.t('section-3.selection-3-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator?.t('section-3.selection-3-desc')}</Typography>
							<Button variant="link" className="text-md">
								<Link
									href="https://github.com/socialincome-san/public/tree/main/recipients_selection"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Typography className="mb-6">{translator?.t('section-3.selection-3-annex')}</Typography>
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}
