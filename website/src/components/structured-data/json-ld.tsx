// Escaping "<" keeps Storyblok text such as "</script>" from closing the tag early.
export const JsonLd = ({ data }: { data: object }) => (
	<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }} />
);
