import { ImageShowcase } from '@socialincome/design-system/data-display/image-showcase/image-showcase';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { GeneratorForm } from './generator-form';

export default function Page() {
	return (
		<main className="flex flex-1 flex-col">
			<GeneratorForm>
				<div className="flex w-full max-w-6xl flex-col items-center">
					<div className="flex flex-col items-center">
						<SectionHeading as="h1" size={1} bold>
							Image Generator
						</SectionHeading>
						<p className="text-muted-foreground mt-3 text-base font-normal sm:text-xl">
							Beschreibe eine <strong className="text-primary font-bold">Szene</strong> im Social-Income-Aquarellstil.
						</p>
					</div>
					<div className="mt-10 w-full sm:mt-14">
						<ImageShowcase
							images={[
								{ src: '/images/showcase/planting.png', alt: 'A family planting a seedling together' },
								{ src: '/images/showcase/children-running.png', alt: 'Children running through their village' },
								{ src: '/images/showcase/family-reading.png', alt: 'A mother reading with two children' },
								{ src: '/images/showcase/sunset.png', alt: 'A family watching the sunset by a lake' },
							]}
						/>
					</div>
				</div>
			</GeneratorForm>
		</main>
	);
}
