import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

type TableProps = WithoutClassName<React.HTMLAttributes<HTMLTableElement>> & {
	/** Row density, read by the cells through the group/table data attribute */
	size?: 'sm' | 'default' | 'lg';
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ size = 'default', ...props }, ref) => (
	<div className="relative w-full overflow-auto">
		<table
			ref={ref}
			data-size={size}
			className="group/table w-full caption-bottom border-separate border-spacing-0 text-sm"
			{...props}
		/>
	</div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	WithoutClassName<React.HTMLAttributes<HTMLTableSectionElement>>
>((props, ref) => <thead ref={ref} className="bg-muted" {...props} />);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, WithoutClassName<React.HTMLAttributes<HTMLTableSectionElement>>>(
	(props, ref) => <tbody ref={ref} className="[&>tr:last-child>*]:border-b-0" {...props} />,
);
TableBody.displayName = 'TableBody';

// Rows with an onClick handler are highlighted on hover; data-state="selected" marks the selected row.
// Cells can react to hovering the row with group-hover/row.
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

const cellVariants = cva('border-b align-middle', {
	variants: {
		// Fit shrinks the column to its content, e.g. for checkboxes or row actions
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
			// Column labels of a data table
			default: 'text-muted-foreground h-10 font-medium whitespace-nowrap group-data-[size=sm]/table:h-9',
			// Header cells of a content table (e.g. from the CMS): may wrap and read like body text
			content: 'text-foreground py-2 font-bold',
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
		className={`${cellVariants({ width, verticalAlign })} p-2 group-data-[size=lg]/table:h-16 group-data-[size=sm]/table:py-1.5`}
		{...props}
	/>
));
TableCell.displayName = 'TableCell';

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
