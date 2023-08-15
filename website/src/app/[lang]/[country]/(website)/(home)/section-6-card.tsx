'use client';

import { Card, Modal, Typography } from '@socialincome/ui';
import Image from 'next/image';
import { useCallback, useRef } from 'react';
import sdgLogo from './sdg-logo.svg';

type SectionCardProps = {
	title: string;
	description: string;
	paragraphs?: string[];
};

export function SectionCard({ title, description, paragraphs = [] }: SectionCardProps) {
	const ref = useRef<HTMLDialogElement>(null);
	const handleShow = useCallback(() => ref.current?.showModal(), [ref]);

	return (
		<>
			<Card normal bordered className="border-neutral my-4 cursor-pointer lg:mx-4" onClick={handleShow}>
				<Card.Body>
					<Card.Title>
						<Typography size="2xl" weight="bold" color="accent">
							{title}
						</Typography>
					</Card.Title>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
						<div className="flex flex-row items-start space-x-2">
							<Typography size="3xl" weight="bold">
								{description}
							</Typography>
						</div>
						<Image className="w-auto max-w-xs" src={sdgLogo} alt="Sustainable Development Goals Logo" />
					</div>
				</Card.Body>
			</Card>

			<Modal ref={ref} backdrop className="w-11/12 max-w-3xl">
				<Modal.Header>
					<Typography as="h2" size="2xl" weight="bold">
						{description}
					</Typography>
				</Modal.Header>
				<Modal.Body className="flex flex-col space-y-8">
					{paragraphs.map((paragraph, index) => (
						<Typography key={index} as="p" size="lg">
							{paragraph}
						</Typography>
					))}
				</Modal.Body>
			</Modal>
		</>
	);
}
