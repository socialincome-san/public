import type { ProgramAboutDetailValue } from '@/components/storyblok/program/build-program-about-content';
import { InfoTooltip } from '@socialincome/design-system/overlays/info-tooltip/info-tooltip';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';

const splitLastWord = (text: string): [string, string] => {
	const lastSpaceIndex = text.lastIndexOf(' ');

	return [text.slice(0, lastSpaceIndex + 1), text.slice(lastSpaceIndex + 1)];
};

const LinkedValue = ({ text, href }: { text: string; href: string }) => {
	const [leadingText, lastWord] = splitLastWord(text);

	// The icon shares a nowrap span with the last word so it never wraps onto a line of its own.
	return (
		<Link href={href} className="hover:underline">
			{leadingText}
			<span className="whitespace-nowrap">
				{lastWord}
				<ArrowUpRight className="ml-0.5 inline size-4 align-text-top" aria-hidden="true" />
			</span>
		</Link>
	);
};

type Props = {
	values: ProgramAboutDetailValue[];
	layout?: 'inline' | 'stacked';
};

const RowValue = ({ text, href, info }: ProgramAboutDetailValue) => {
	const content = href ? <LinkedValue text={text} href={href} /> : text;

	return info ? (
		<span className="inline-flex items-center gap-1.5">
			{content}
			<InfoTooltip label={info.label}>{info.text}</InfoTooltip>
		</span>
	) : (
		content
	);
};

export const ProgramAboutRowValues = ({ values, layout = 'inline' }: Props) =>
	layout === 'stacked' ? (
		<span className="flex flex-col gap-2">
			{values.map((value) => (
				<span key={value.text}>
					<RowValue {...value} />
				</span>
			))}
		</span>
	) : (
		values.map((value, index) => (
			<Fragment key={value.text}>
				{index > 0 ? ', ' : null}
				<RowValue {...value} />
			</Fragment>
		))
	);
