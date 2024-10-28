'use client'
import { useEffect, useState } from 'react';
import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, Badge } from '@socialincome/ui';

export function SelectionProcess({ lang }: DefaultParams) {
	const [translator, setTranslator] = useState<Translator | null>(null);
	// Set 'preselection' as the default active box
	const [activeBox, setActiveBox] = useState<'preselection' | 'selection'>('preselection');

	useEffect(() => {
		async function loadTranslator() {
			const translatorInstance = await Translator.getInstance({
				language: lang,
				namespaces: ['website-selection'],
			});
			setTranslator(translatorInstance);
		}
		loadTranslator();
	}, [lang]);

	if (!translator) {
		return null;
	}

	return (
		<BaseContainer className="mt-20">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
				{/* Left Column with Boxes */}
				<div className="mt-9 md:col-span-1">
					<div>
						<div className="flex flex-col gap-4">
							{/* First Box */}
							<a
								href="#preselection"
								onClick={() => setActiveBox('preselection')}
								className={`border-primary group flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 ${
									activeBox === 'preselection' ? 'bg-primary' : 'hover:bg-primary hover:text-popover-foreground'
								}`}
							>
								<div
									className={`bg-primary flex h-8 w-8 items-center justify-center rounded-full bg-opacity-10 text-lg ${
										activeBox === 'preselection'
											? 'text-primary bg-white bg-opacity-100'
											: 'text-primary group-hover:bg-white'
									}`}
								>
									1
								</div>
								<div>
									<Typography
										weight="medium"
										size="xl"
										className={`mb-2 ${
											activeBox === 'preselection' ? 'text-accent' : 'text-accent group-hover:text-accent'
										}`}
									>
										{translator.t('section-3.preselection-title')}
									</Typography>
									<Typography
										size="xl"
										className={`${activeBox === 'preselection' ? 'text-white' : 'group-hover:text-white'}`}
									>
										{translator.t('section-3.preselection-subtitle')}
									</Typography>
								</div>
							</a>

							{/* Second Box */}
							<a
								href="#selection"
								onClick={() => setActiveBox('selection')}
								className={`border-primary group flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 ${
									activeBox === 'selection' ? 'bg-primary' : 'hover:bg-primary hover:text-popover-foreground'
								}`}
							>
								<div
									className={`bg-primary flex h-8 w-8 items-center justify-center rounded-full bg-opacity-10 text-lg ${
										activeBox === 'selection'
											? 'text-primary bg-white bg-opacity-100'
											: 'text-primary group-hover:bg-white'
									}`}
								>
									2
								</div>
								<div>
									<Typography
										weight="medium"
										size="xl"
										className={`mb-2 ${
											activeBox === 'selection' ? 'text-accent' : 'text-accent group-hover:text-accent'
										}`}
									>
										{translator.t('section-3.selection-title')}
									</Typography>
									<Typography
										size="xl"
										className={`${activeBox === 'selection' ? 'text-white' : 'group-hover:text-white'}`}
									>
										{translator.t('section-3.selection-subtitle')}
									</Typography>
								</div>
							</a>
						</div>
					</div>
				</div>

				{/* Right Column with Content */}
				<div className="space-y-4 md:col-span-1">
					{/* Preselection Section */}
					<div id="preselection" className="pt-8" style={{ scrollMarginTop: '60px' }}>
						<Typography weight="medium" className="mb-4 text-3xl sm:text-4xl md:text-4xl">
							{translator.t('section-3.preselection-title')}
						</Typography>
						<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-desc')}</Typography>
						<div className="mb-6 flex items-center space-x-2">
							<Badge className="bg-primary text-md border-none">
								<Typography weight="normal">{translator.t('section-3.goal')}</Typography>
							</Badge>
							<Typography className="text-md">{translator.t('section-3.preselection-goal')}</Typography>
						</div>
					</div>
					<div>
						{/* Preselection Subsections */}
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator.t('section-3.preselection-1-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-1-desc')}</Typography>
							<Typography className="text-md mb-6">{translator.t('section-3.preselection-1-annex')}</Typography>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator.t('section-3.preselection-2-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-2-desc')}</Typography>
							<Typography className="text-md mb-6">{translator.t('section-3.preselection-2-annex')}</Typography>
						</div>
						<div>
							<Typography weight="medium" className="text-accent mb-2 text-xl">
								{translator.t('section-3.preselection-3-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator.t('section-3.preselection-3-desc')}</Typography>
							<Typography className="text-md mb-6">{translator.t('section-3.preselection-3-annex')}</Typography>
						</div>
					</div>

					{/* Selection Section */}
						<div id="selection" className="pt-8" style={{ scrollMarginTop: '60px' }}>
							<Typography weight="medium" className="mb-4 text-3xl sm:text-4xl md:text-4xl">
								{translator.t('section-3.selection-title')}
							</Typography>
							<Typography className="mb-4 text-xl">{translator.t('section-3.selection-desc')}</Typography>
							<div className="mb-6 flex items-center space-x-2">
								<Badge className="bg-primary text-md border-none">
									<Typography weight="normal">{translator.t('section-3.goal')}</Typography>
								</Badge>
								<Typography className="text-md">{translator.t('section-3.selection-goal')}</Typography>
							</div>
						</div>
						<div>
							{/* Selection Subsections */}
							<div>
								<Typography weight="medium" className="text-accent mb-2 text-xl">
									{translator.t('section-3.selection-1-title')}
								</Typography>
								<Typography className="mb-4 text-xl">{translator.t('section-3.selection-1-desc')}</Typography>
								<Typography className="text-md mb-6">{translator.t('section-3.selection-1-annex')}</Typography>
							</div>
							<div>
								<Typography weight="medium" className="text-accent mb-2 text-xl">
									{translator.t('section-3.selection-2-title')}
								</Typography>
								<Typography className="mb-4 text-xl">{translator.t('section-3.selection-2-desc')}</Typography>
								<Typography className="text-md mb-6">{translator.t('section-3.selection-2-annex')}</Typography>
							</div>
							<div>
								<Typography weight="medium" className="text-accent mb-2 text-xl">
									{translator.t('section-3.selection-3-title')}
								</Typography>
								<Typography className="mb-4 text-xl">{translator.t('section-3.selection-3-desc')}</Typography>
								<Typography className="text-md mb-6">{translator.t('section-3.selection-3-annex')}</Typography>
							</div>
						</div>
					</div>
				</div>
		</BaseContainer>
);
}