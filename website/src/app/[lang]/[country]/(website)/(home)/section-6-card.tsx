'use client';

import { Card, Modal, Typography } from '@socialincome/ui';
import Image from 'next/image';
import { useCallback, useRef } from 'react';
import sdgLogo from './sdgLogo.svg';

type SectionCardProps = {
	titles: {
		main: string;
		articles: string;
		faqs: string;
	};
	items?: string[];
	paragraphs?: string[];
	articles?: { title: string; author: string; link: string }[];
};

export function SectionCardSix({ titles, items = [], paragraphs = [], articles = [] }: SectionCardProps) {
	const ref = useRef<HTMLDialogElement>(null);
	const handleShow = useCallback(() => ref.current?.showModal(), [ref]);

	return (
		<>
			<Card normal bordered className="border-neutral my-4 cursor-pointer lg:mx-4" onClick={handleShow}>
				<Card.Body>
					<Card.Title>
						<Typography size="2xl" weight="bold" color="accent">
							{titles.main}
						</Typography>
					</Card.Title>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
						{items.map((item, index) => (
							<div key={index} className="flex flex-row items-start space-x-2">
								<Typography size="3xl" weight="bold">
									{item}
								</Typography>
							</div>
						))}
						<Image className="h-auto max-w-xs" src={sdgLogo} alt="" />
					</div>
				</Card.Body>
			</Card>

			<Modal ref={ref} backdrop className="w-11/12 max-w-3xl">
				<Modal.Header>
					<Typography as="h2" size="2xl" weight="bold">
						{titles.main}
					</Typography>
				</Modal.Header>
				<Modal.Body className="flex flex-col space-y-8">
					{paragraphs.map((paragraph, index) => (
						<Typography key={index} as="p" size="lg">
							{paragraph}
						</Typography>
					))}
					{/* {articles.length > 0 && (
						<div>
							<Typography size="xl" weight="medium">
								{titles.articles}
							</Typography>
							<div className="grid grid-cols-1 divide-y">
								{articles.map((article, index) => (
									<div key={index} className="py-4">
										<Typography>{article.author}</Typography>
										<Link href={article.link} target="_blank">
											<Typography color="secondary">{article.title}</Typography>
										</Link>
									</div>
								))}
							</div>
						</div>
					)} */}
				</Modal.Body>
			</Modal>
		</>
	);
}
