type QrPaymentDetailFieldProps = {
	label: string;
	value: string;
};

export const QrPaymentDetailField = ({ label, value }: QrPaymentDetailFieldProps) => (
	<div className="text-foreground text-sm leading-5">
		<p className="font-bold">{label}</p>
		<p className="font-normal">{value}</p>
	</div>
);
