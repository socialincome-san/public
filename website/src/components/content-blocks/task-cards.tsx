import type { TaskCards } from '@/generated/storyblok/types/109655/storyblok-components';
import { TaskCardGrid } from '@socialincome/design-system/data-display/task-card-grid/task-card-grid';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: TaskCards;
};

export const TaskCardsBlock = async ({ blok }: Props) => {
	const tasks = (blok.tasks ?? []).filter((task) => task.title.trim());
	if (tasks.length === 0) {
		return null;
	}
	const t = await getTranslations('website-common');

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<div className="space-y-8">
				{blok.title ? (
					<SectionHeading align="left" size={4} bold>
						{blok.title}
					</SectionHeading>
				) : null}
				<TaskCardGrid
					items={tasks.map((task) => ({ title: task.title, description: task.description?.trim() }))}
					showMoreLabel={t('task-cards.show-all', { count: tasks.length })}
					showLessLabel={t('task-cards.show-fewer')}
				/>
			</div>
		</BlockWrapper>
	);
};
