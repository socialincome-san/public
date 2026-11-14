import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

type TableProps = WithoutClassName<React.HTMLAttributes<HTMLTableElement>> & {
	/** Read by the cells through the group/table data attribute */
	size?: 'sm' | 'default' | 'lg';
	stickyHeader?: boolean;
	/** `card` sets the table on a white panel, for pages with a tinted background. Read by the cells like `size`. */
	surface?: 'none' | 'card';
	/** Note or source shown below the table */
	caption?: React.ReactNode;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
	({ size = 'default', stickyHeader = false, surface = 'none', caption, ...props }, ref) => {
		const table = (
			<div
				className={cn(
					'relative w-full',
					stickyHeader ? 'overflow-x-auto overflow-y-clip' : 'overflow-auto',
					surface === 'card' && 'bg-card shadow-card rounded-xl border',
				)}
			>
				<table
					ref={ref}
					data-size={size}
					data-surface={surface}
					className="group/table w-full caption-bottom border-separate border-spacing-0 text-sm"
					{...props}
				/>
			</div>
		);

		if (!caption) {
			return table;
		}

		return (
			<figure className="w-full">
				{table}
				<figcaption className="text-muted-foreground mt-3 text-sm">{caption}</figcaption>
			</figure>
		);
	},
);
Table.displayName = 'Table';

// The table sets the default size, so header and body can each step up on their own
const sectionTextSizes = {
	default: '',
	lg: 'text-base',
};

const tableHeaderVariants = cva('', {
	variants: {
		variant: {
			default: 'bg-muted',
			// CMS tables: a rule under the header instead of a fill, which only the card surface keeps
			content: 'group-data-[surface=card]/table:bg-muted [&>tr>*]:border-foreground/30',
		},
		sticky: {
			true: 'sticky top-0 z-10',
			false: '',
		},
		textSize: sectionTextSizes,
	},
	defaultVariants: {
		variant: 'default',
		sticky: false,
		textSize: 'default',
	},
});

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	WithoutClassName<React.HTMLAttributes<HTMLTableSectionElement>> & VariantProps<typeof tableHeaderVariants>
>(({ sticky, variant, textSize, ...props }, ref) => (
	<thead ref={ref} className={tableHeaderVariants({ variant, sticky, textSize })} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	WithoutClassName<React.HTMLAttributes<HTMLTableSectionElement>> & { textSize?: keyof typeof sectionTextSizes }
>(({ textSize = 'default', ...props }, ref) => (
	<tbody ref={ref} className={cn('[&>tr:last-child>*]:border-b-0', sectionTextSizes[textSize])} {...props} />
));
TableBody.displayName = 'TableBody';

// Rows with an onClick handler get hover styles
const TableRow = React.forwardRef<HTMLTableRowElement, WithoutClassName<React.HTMLAttributes<HTMLTableRowElement>>>(
	(props, ref) => (
		<tr
			ref={ref}
			className={
				props.onClick
					? 'group/row hover:bg-muted/60 data-[state=selected]:bg-muted cursor-pointer transition-colors'
					: 'group/row data-[state=selected]:bg-muted'
			}
			{...props}
		/>
	),
);
TableRow.displayName = 'TableRow';

const cellVariants = cva('border-b align-middle group-data-[surface=card]/table:px-4', {
	variants: {
		width: {
			auto: '',
			fit: 'w-px whitespace-nowrap',
		},
		verticalAlign: {
			middle: '',
			top: 'align-top',
		},
	},
	defaultVariants: {
		width: 'auto',
		verticalAlign: 'middle',
	},
});

type CellVariantProps = VariantProps<typeof cellVariants>;

const tableHeadVariants = cva('px-2 text-left', {
	variants: {
		variant: {
			default: 'text-muted-foreground h-10 font-medium whitespace-nowrap group-data-[size=sm]/table:h-9',
			// CMS tables: headers wrap and read like body text
			content: 'text-foreground py-2 font-bold group-data-[surface=card]/table:py-3',
			// Row labels in CMS tables: lighter than the column headers above them
			contentRow: 'text-foreground py-2 font-medium group-data-[surface=card]/table:py-3',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	WithoutClassName<React.ThHTMLAttributes<HTMLTableCellElement>> & CellVariantProps & VariantProps<typeof tableHeadVariants>
>(({ width, verticalAlign, variant, ...props }, ref) => (
	<th ref={ref} className={`${cellVariants({ width, verticalAlign })} ${tableHeadVariants({ variant })}`} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	WithoutClassName<React.TdHTMLAttributes<HTMLTableCellElement>> & CellVariantProps
>(({ width, verticalAlign, ...props }, ref) => (
	<td
		ref={ref}
		className={`${cellVariants({ width, verticalAlign })} p-2 group-data-[size=lg]/table:h-16 group-data-[size=sm]/table:py-1.5 group-data-[surface=card]/table:py-3`}
		{...props}
	/>
));
TableCell.displayName = 'TableCell';

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
