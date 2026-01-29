import { ChevronDown } from 'lucide-react';
import { NavItem } from './navbar-desktop';

type Props = {
	nav: NavItem[];
	open: string | null;
	onClick: (item: NavItem) => void;
};

export const NavLinks = ({ nav, open, onClick }: Props) => (
	<div className="flex items-center gap-6">
		{nav.map((item) => {
			const hasChildren = !!item.sections;
			const isOpen = open === item.label && hasChildren;
			return (
				<button
					key={item.label}
					type="button"
					onClick={() => onClick(item)}
					className="flex items-center gap-1.5 text-base font-medium"
				>
					{item.label}
					{hasChildren && (
						<ChevronDown className={`h-4 w-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
					)}
				</button>
			);
		})}
	</div>
);
