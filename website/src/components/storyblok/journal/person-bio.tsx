import { resolveRichTextHref } from '@/components/storyblok/rich-text/shared-resolvers';
import { getBioSegments, splitFirstSentence, type BioSegment } from '@/lib/storyblok/person-bio';
import { LeadSection } from '@socialincome/design-system/layout/lead-section/lead-section';
import NextLink from 'next/link';

type Props = {
	label: string;
	// The bio field of a person: rich text limited to links, or the plain string of older stories
	bio: unknown;
};

// Keyed by where a segment starts in the text, which is unique and stable
const renderSegments = (segments: BioSegment[]) =>
	segments
		.reduce<{ segment: BioSegment; start: number }[]>(
			(placed, segment) => [
				...placed,
				{ segment, start: placed.reduce((length, { segment: previous }) => length + previous.text.length, 0) },
			],
			[],
		)
		.map(({ segment, start }) =>
			segment.href ? (
				<NextLink key={start} href={resolveRichTextHref(segment.href)}>
					{segment.text}
				</NextLink>
			) : (
				segment.text
			),
		);

export const PersonBio = ({ label, bio }: Props) => {
	const { lead, rest } = splitFirstSentence(getBioSegments(bio));
	if (lead.length === 0) {
		return null;
	}

	return (
		<LeadSection label={label} rest={rest.length > 0 ? renderSegments(rest) : undefined}>
			{renderSegments(lead)}
		</LeadSection>
	);
};
