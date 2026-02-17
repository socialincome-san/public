import * as React from 'react';

type AdditionalNumbersProps = {
	children: React.ReactNode;
};

export function AdditionalNumbers({ children }: AdditionalNumbersProps) {
	return <div className="mt-auto grid grid-cols-2 gap-4 pb-4 pt-4 text-sm">{children}</div>;
}
