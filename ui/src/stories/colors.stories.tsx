import type { Meta } from '@storybook/react';
import { Button } from '../components/button';
import { cn } from '../lib/utils';

const meta: Meta = {
	title: 'Colors',
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;

interface ColorInfo {
	name: string;
	variable: string;
	hsl?: string;
}

const ColorSwatch = ({ name, variable, hsl }: ColorInfo) => {
	/* List all possible background classes explicitly so Tailwind can statically analyze them.
	 * Using string interpolation like `bg-${variable}` prevents Tailwind from detecting the classes.
	 * This approach ensures all necessary classes are included in the final CSS bundle.
	 */
	const possibleClasses = [
		'bg-background',
		'bg-foreground',
		'bg-primary',
		'bg-primary-muted',
		'bg-primary-foreground',
		'bg-primary-foreground-muted',
		'bg-secondary',
		'bg-secondary-muted',
		'bg-secondary-foreground',
		'bg-secondary-foreground-muted',
		'bg-accent',
		'bg-accent-muted',
		'bg-accent-foreground',
		'bg-accent-foreground-muted',
		'bg-destructive',
		'bg-destructive-muted',
		'bg-destructive-foreground',
		'bg-destructive-foreground-muted',
	];
	return (
		<div className="flex flex-col gap-2">
			<div
				className={cn(
					'h-20',
					'w-20',
					'rounded-md',
					possibleClasses.find((className) => className === `bg-${variable}`),
				)}
			/>
			<div className="text-sm font-medium">{name}</div>
			<div className="text-muted-foreground text-xs">var(--{variable})</div>
			{hsl && <div className="text-muted-foreground text-xs">HSL: {hsl}</div>}
		</div>
	);
};

const ThemeExample = ({ theme }: { theme: 'default' | 'blue' }) => {
	// create a themeClassName object to map theme to the corresponding class to make TailwindCSS happy
	const themeClassName = {
		default: 'theme-default',
		blue: 'theme-blue',
	}[theme];
	return (
		<div className={cn(themeClassName, 'bg-background border-border rounded-lg border p-6')}>
			<h4 className="text-foreground mb-4 font-medium">{theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</h4>
			<div className="flex flex-col gap-4">
				<div className="bg-card border-border rounded-lg border p-4">
					<div className="text-card-foreground mb-2">Card Example</div>
					<div className="text-card-foreground-muted mb-4 text-sm">Card with muted text</div>
					<div className="flex gap-2">
						<Button variant="default">Primary Button</Button>
						<Button variant="ghost">Secondary Button</Button>
					</div>
				</div>
				<div className="flex flex-wrap gap-4">
					<div className="bg-primary text-primary-foreground rounded p-3">Primary Color</div>
					<div className="bg-muted text-muted-foreground rounded p-3">Muted Color</div>
					<div className="bg-secondary text-secondary-foreground rounded p-3">Secondary Color</div>
					<div className="bg-accent text-accent-foreground rounded p-3">Accent Color</div>
				</div>
			</div>
		</div>
	);
};

const ColorSection = ({ title, colors, className }: { title: string; colors: ColorInfo[]; className?: string }) => (
	<div className={cn('pb-8', className)}>
		<h3 className="mb-4 text-lg font-semibold">{title}</h3>
		<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{colors.map((color) => (
				<ColorSwatch key={color.variable} {...color} />
			))}
		</div>
	</div>
);

export const ColorSystem = () => {
	return (
		<div className="p-6">
			<div className="mx-auto max-w-[1200px]">
				<h2 className="mb-8 text-2xl font-bold">Color System</h2>

				<div className="prose mb-8 max-w-none">
					<p>
						Our color system is built with accessibility and flexibility in mind. It supports multiple themes (default
						and blue) and provides consistent color patterns across the application.
					</p>
					<h3>Color Values</h3>
					<p>Colors are defined using HSL (Hue, Saturation, Lightness) values, which provides several benefits:</p>
					<ul>
						<li>
							<strong>Consistent Relationships:</strong> Colors maintain their relationships across themes
						</li>
						<li>
							<strong>Intuitive Adjustments:</strong> Easy to create variations by adjusting saturation and lightness
						</li>
						<li>
							<strong>Semantic Understanding:</strong> HSL values are more intuitive to understand and modify than hex
							codes
						</li>
					</ul>
					<p>
						Example: Primary color in default theme is defined as <code>--primary: 212 57% 47%</code> where:
					</p>
					<ul>
						<li>212 is the hue (blue)</li>
						<li>57% is the saturation</li>
						<li>47% is the lightness</li>
					</ul>
					<h3>Usage Guidelines</h3>
					<ul>
						<li>
							<strong>Background Colors:</strong> Use bg-background for main container backgrounds, bg-card for card
							backgrounds
						</li>
						<li>
							<strong>Text Colors:</strong> Use text-foreground for main text, text-muted-foreground for secondary text
						</li>
						<li>
							<strong>Buttons & Interactive Elements:</strong>
							<ul className="ml-4 mt-1">
								<li>Primary buttons: bg-primary with text-primary-foreground</li>
								<li>Secondary buttons: bg-card-muted with text-muted-foreground</li>
								<li>Add hover:bg-primary/90 for hover states</li>
							</ul>
						</li>
						<li>
							<strong>Cards:</strong> Use bg-card for background, text-card-foreground for text, and border-border for
							borders
						</li>
						<li>
							<strong>Emphasis:</strong> Use accent colors sparingly for emphasis and highlighting
						</li>
						<li>
							<strong>Feedback:</strong> Use destructive colors for error states and warnings
						</li>
					</ul>
				</div>

				<ColorSection
					title="Base Colors"
					colors={[
						{ name: 'Background', variable: 'background', hsl: '50 33% 96%' },
						{ name: 'Foreground', variable: 'foreground', hsl: '206 99% 31%' },
					]}
				/>

				<ColorSection
					className="bg-background"
					title="Primary Colors"
					colors={[
						{ name: 'Primary', variable: 'primary', hsl: '212 57% 47%' },
						{ name: 'Primary (Muted)', variable: 'primary-muted', hsl: '216 54% 63%' },
						{ name: 'Primary Foreground', variable: 'primary-foreground', hsl: '216 54% 100%' },
						{ name: 'Primary Foreground (Muted)', variable: 'primary-foreground-muted', hsl: '216 54% 97%' },
					]}
				/>

				<ColorSection
					className="bg-background"
					title="Secondary Colors"
					colors={[
						{ name: 'Secondary', variable: 'secondary', hsl: '8 89% 62%' },
						{ name: 'Secondary (Muted)', variable: 'secondary-muted', hsl: '8 89% 70%' },
						{ name: 'Secondary Foreground', variable: 'secondary-foreground', hsl: '8 89% 100%' },
						{ name: 'Secondary Foreground (Muted)', variable: 'secondary-foreground-muted', hsl: '8 89% 97%' },
					]}
				/>

				<ColorSection
					className="bg-background"
					title="Accent Colors"
					colors={[
						{ name: 'Accent', variable: 'accent', hsl: '48 100% 49%' },
						{ name: 'Accent (Muted)', variable: 'accent-muted', hsl: '48 100% 57%' },
						{ name: 'Accent Foreground', variable: 'accent-foreground', hsl: '48 100% 0%' },
						{ name: 'Accent Foreground (Muted)', variable: 'accent-foreground-muted', hsl: '48 100% 30%' },
					]}
				/>

				<ColorSection
					className="bg-background"
					title="Semantic Colors"
					colors={[
						{ name: 'Destructive', variable: 'destructive', hsl: '0 75% 42%' },
						{ name: 'Destructive (Muted)', variable: 'destructive-muted', hsl: '0 73% 65%' },
						{ name: 'Destructive Foreground', variable: 'destructive-foreground', hsl: '60 9.1% 97.8%' },
						{ name: 'Destructive Foreground (Muted)', variable: 'destructive-foreground-muted', hsl: '0 100% 98%' },
					]}
				/>

				<div className="prose mt-12 max-w-none">
					<h3>Theme Support</h3>
					<p>The color system supports two distinct themes, each with its own purpose and characteristics:</p>
					<ul className="mb-6">
						<li>
							<strong>Default Theme:</strong> The main theme used across most of the application, featuring a light
							background with blue accents
						</li>
						<li>
							<strong>Blue Theme:</strong> A high-contrast theme with blue background and yellow accents, used for
							emphasis sections
						</li>
					</ul>
					<div className="my-6 flex flex-col gap-4">
						<ThemeExample theme="default" />
						<ThemeExample theme="blue" />
					</div>
					<p>Themes can be applied using the theme-default or theme-blue classes on container elements.</p>
				</div>
			</div>
		</div>
	);
};
