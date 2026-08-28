type Props = {
	message: string;
};

export const OpenSourceUnavailableMessage = ({ message }: Props) => {
	return (
		<p className="text-muted-foreground mb-6 text-center" role="status">
			{message}
		</p>
	);
};
