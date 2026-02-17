import * as React from 'react';

type SectionTitleProps = {
	children: React.ReactNode;
};

export function SectionTitle({ children }: SectionTitleProps) {
	return <h2 className="text-xl font-medium">{children}</h2>;
}
