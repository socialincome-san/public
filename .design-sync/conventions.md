# Social Income design system - how to build with it

## Setup

No provider or theme wrapper is needed. Link `styles.css` (tokens, the Unica77 font, every component style) and
load `_ds_bundle.js`; components live on `window.SocialIncomeDS`. The page font is Unica77 with `ss04` on - do not
set another `font-family`.

## Styling rules

1. **Components style themselves.** Pick the look through props (`variant`, `size`, `padding`, `elevation`,
   `surface`, `align`, `fullWidth`...). Never pass `className` to a library component; margins, width and grid
   placement belong to the wrapper you write around it.
2. **Your own layout glue uses Tailwind classes, but only ones the stylesheet ships.** The CSS is compiled from
   the library's own source, so a class works only if the library itself uses it. Verified safe:
   - Layout: `flex flex-col grid items-center justify-between w-full h-full mx-auto max-w-content w-site-width
     max-w-xl max-w-2xl max-w-3xl grid-cols-2 grid-cols-3 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3
     lg:grid-cols-4 sm:flex-row md:flex-row`
   - Spacing: `gap-1 gap-2 gap-3 gap-4 gap-6 gap-8 gap-10 p-2 p-4 p-6 p-8 p-10 px-2 px-4 px-6 px-8 py-2 py-4
     py-6 py-8 py-16 mt-2 mt-4 mt-6 mt-8 mb-2 mb-4 mb-6 mb-8`
   - Type: `text-2xs text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl text-5xl text-6xl
     text-display font-medium font-semibold font-bold text-center uppercase leading-tight tracking-tight
     text-balance`
   - Color: `text-foreground text-muted-foreground text-primary text-primary-foreground text-destructive
     text-confirm text-white bg-background bg-card bg-muted bg-primary bg-secondary bg-accent bg-foreground
     bg-backstage bg-banner-blue bg-white border border-border`
   - Shape: `rounded-lg rounded-2xl rounded-5xl rounded-full shadow-card shadow-raised`
   Anything else (e.g. `py-12`, `space-y-4`, `gap-12`, `max-w-4xl`, palette colors like `bg-blue-500`) will NOT
   resolve. Use a listed class or an inline `style` with `var(--...)` tokens instead.
3. **Colors are semantic tokens only.** There is no Tailwind palette. Raw values are HSL triplets:
   `hsl(var(--primary))`, `hsl(var(--foreground))`, `hsl(var(--muted-foreground))`, `hsl(var(--border))`.
   Brand gradient: `linear-gradient(to right, hsl(var(--gradient-button-from)), hsl(var(--gradient-button-to)))`.
   Primary/foreground is the deep blue `197 79% 15%`; `white`/`black` only for text on photos or video.

## Where the truth lives

- `styles.css` -> `_ds_bundle.css`: the full compiled class list and the `--*` token values.
- `components/<group>/<Name>/<Name>.prompt.md`: props and story examples for each component; `<Name>.d.ts` is the
  exact prop contract.
- Images and flags from `/assets/...` are app-served and absent here: `Avatar` and `CountryFlag` fall back to
  initials / country codes. Pass full image URLs when you need a real picture.

## Example

```jsx
const { BlockWrapper, SectionHeading, Card, Stat, Badge, Button } = window.SocialIncomeDS;

<BlockWrapper>
	<div className="flex flex-col gap-8">
		<SectionHeading size={2}>Income that changes lives</SectionHeading>
		<div className="grid grid-cols-3 gap-4">
			<Card>
				<div className="flex flex-col gap-4">
					<Badge variant="verified">Verified</Badge>
					<Stat label="Recipients" value="168" />
				</div>
			</Card>
		</div>
		<Button>Donate now</Button>
	</div>
</BlockWrapper>
```
