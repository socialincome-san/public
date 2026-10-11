// Mirrors design-system/src/components/data-display/card/card.stories.tsx. Owned because that story imports
// next/image directly, which crashes outside Next.js; the image goes through the build's next/image shim.
import { Avatar, AvatarFallback, Card } from '@socialincome/design-system';
import Image from '@ds-stories/.design-sync/shims/next-image';

export const Default = () => <Card>Test</Card>;

export const Variants = () => (
	<div className="flex items-stretch gap-6">
		<Card>Default</Card>
		<Card padding="compact" elevation="flat">
			Compact and flat
		</Card>
		<Card padding="compact" surface="gradient">
			Gradient
		</Card>
		<Card padding="none">
			<div className="p-10">No padding</div>
		</Card>
	</div>
);

export const WithContent = () => (
	<Card>
		<div className="flex items-center gap-6">
			<div className="flex flex-col gap-4">
				<h2 className="text-2xl font-semibold">Debt instead of opportunity? Why we don&apos;t offer microloans.</h2>
				<div className="flex items-center gap-2">
					<Avatar>
						<AvatarFallback>SS</AvatarFallback>
					</Avatar>
					<span className="text-foreground font-semibold">Sandino Scheidegger</span>
				</div>
			</div>

			<Image
				src="https://a.storyblok.com/f/109655/3000x2001/0b43ecee20/alligator-crocodile.jpg/m/640x524/filters:focal(380x1154:381x1155):format(webp)"
				alt="Alligator"
				width={300}
				height={200}
				className="rounded-2xl object-cover"
			/>
		</div>
	</Card>
);
