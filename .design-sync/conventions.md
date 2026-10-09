# Social Income design system - how to build with it

## Setup

No provider or theme wrapper is needed. Link `styles.css` (tokens, the Unica77 font, every component style) and
load `_ds_bundle.js`; components live on `window.SocialIncomeDS`. Never set another `font-family`.

## Rule 1: use an existing component first

Before writing any UI element, look for it in this library. Read `components/<group>/<Name>/<Name>.prompt.md`
for props and examples. If a component is close, use it with its props; do not rebuild a look-alike.

| You need | Use |
|---|---|
| Button, CTA, icon button | `Button` (`variant`, `size`, `fullWidth`), `LinkPill`, `VideoControlButton` |
| Text field, search, select | `Input`, `SearchInput`, `Select`, `Combobox`, `MultiSelect`, `DatePicker`, `Calendar` |
| Choice controls | `Checkbox`, `RadioGroup`, `RadioCard`, `SelectableCard`, `Switch`, `Slider`, `SegmentedToggle` |
| Form with labels/errors | `Form` + `Label` |
| Surface / panel | `Card` (`padding`, `elevation`, `surface="gradient"`), `DetailPanel`, `StatusCard`, `RecordSummary` |
| Numbers / KPIs | `Stat`, `StatGrid`, `StatHeadline`, `StatPanel`, `StatProgress`, `Progress`, `BreakdownList` |
| Tables | `DataTable`, `DataTableHeader`, `DataTableToolbar`, `DataTablePagination`, `DataTableEmptyState`, `Table` |
| People | `Avatar`, `AvatarStack`, `PeopleStack`, `PersonCard`, `ContributorsCard`, `CommunityPanel` |
| Status / feedback | `Badge`, `Alert`, `SuccessBanner`, `CardAlertFooter`, `ThankYouPanel`, `FallbackPage` |
| Overlays | `Dialog` (also for confirm/alert dialogs), `Backstage` (side sheet/drawer), `Popover`, `Tooltip`, `InfoTooltip`, `DropdownMenu`, `Command` |
| Navigation | `SiteHeader`, `SiteFooter`, `PortalNavbar`, `PortalAppShell`, `Tabs`, `TabNavigation`, `Breadcrumb`, `StepIndicator`, `WizardFooter`, `CheckoutFooter` |
| Page layout | `BlockWrapper` (page section), `SectionHeading`, `PageIntro`, `SplitSection`, `CardGrid`, `MediaHero`, `FilterBar` |
| Disclosure, motion | `Accordion`, `ShowMoreToggle`, `Carousel`, `Marquee` |
| Brand | `SocialIncomeLogo`, `CountryFlag`, `InstagramIcon` and the other social icons |

## Rule 2: nothing fits? Start from shadcn/ui, not from scratch

This library is built on shadcn/ui (Radix + the same token names), so new pieces stay aligned when they copy
shadcn's anatomy. If you can browse, read `https://ui.shadcn.com/docs/components/<name>` first. shadcn
components NOT in this library yet (as of this sync): Textarea, Toast/Sonner, Skeleton, Spinner, Collapsible,
Context Menu, Menubar, Hover Card, Input OTP, Kbd, Chart, Scroll Area, Resizable, Aspect Ratio, Sidebar,
Button Group, Field/Input Group. Covered under another name - use ours: Sheet/Drawer -> `Backstage`,
Toggle Group -> `SegmentedToggle`, Pagination -> `DataTablePagination`, Empty -> `DataTableEmptyState`,
Alert Dialog -> `Dialog`, Navigation Menu -> `SiteHeader`, Progress -> `Progress`/`StatProgress`.

Keep shadcn's structure, roles and states, then restyle it to Social Income:

- **Shape:** controls are pills (`rounded-full`: buttons, inputs, badges, toggles, inputs are `h-10`); surfaces
  are soft (`rounded-3xl` cards and dialogs, `rounded-5xl` hero blocks). No sharp corners.
- **Color:** deep-blue `text-foreground` on `bg-background`/`bg-card`; quiet fills `bg-muted`/`bg-secondary`;
  borders `border border-border` (inputs `border-input`). Primary CTAs use the brand gradient
  `linear-gradient(to right, hsl(var(--gradient-button-from)), hsl(var(--gradient-button-to)))` - reuse `Button`
  rather than recreating it. Success `bg-confirm`, error `bg-destructive`/`text-destructive`.
- **Depth:** `shadow-card` for resting surfaces, `shadow-raised` on hover/lift, `shadow-overlay` for popovers;
  modal backdrop `bg-foreground/80`.
- **Type:** Unica77 only; body `text-sm`/`text-base`, headings via `SectionHeading`, big numbers `text-4xl`+.
- **Focus:** `focus-visible:ring-1 ring-ring`.

## Rule 3: only use classes the stylesheet ships

The CSS is compiled from this library's source, so a Tailwind class works only if the library uses it. Verified:

- Layout: `flex flex-col grid items-center justify-between w-full h-full mx-auto max-w-content w-site-width
  max-w-xl max-w-2xl max-w-3xl grid-cols-2 grid-cols-3 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3
  lg:grid-cols-4 sm:flex-row md:flex-row`
- Spacing: `gap-1 gap-2 gap-3 gap-4 gap-6 gap-8 gap-10 p-2 p-4 p-6 p-8 p-10 px-2 px-4 px-6 px-8 py-2 py-4 py-6
  py-8 py-16 mt-2 mt-4 mt-6 mt-8 mb-2 mb-4 mb-6 mb-8`
- Type: `text-2xs text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl text-5xl text-6xl
  text-display font-medium font-semibold font-bold text-center uppercase leading-tight tracking-tight text-balance`
- Color: `text-foreground text-muted-foreground text-primary text-primary-foreground text-destructive
  text-confirm text-white bg-background bg-card bg-muted bg-secondary bg-accent bg-popover bg-foreground
  bg-confirm bg-destructive bg-backstage bg-banner-blue bg-white border border-border border-input`
- Shape/depth: `rounded-full rounded-lg rounded-2xl rounded-3xl rounded-5xl shadow-xs shadow-card shadow-raised
  shadow-overlay`

Anything else (`py-12`, `space-y-4`, `gap-12`, `max-w-4xl`, `animate-spin`, palette colors like `bg-blue-500`)
does NOT resolve. Use a listed class, or an inline `style` with tokens: colors are HSL triplets
(`hsl(var(--primary))`, `hsl(var(--muted-foreground))`, `hsl(var(--border))`); shadows are literal
(card `0 4px 28px 0 rgb(0 30 101 / 0.07)`, raised `0 4px 28px 0 rgb(0 30 101 / 0.12)`). Never pass `className`
to a library component; its look comes from props.

## Where the truth lives

- `styles.css` -> `_ds_bundle.css`: the full compiled class list and `--*` token values.
- `components/<group>/<Name>/<Name>.prompt.md` and `<Name>.d.ts`: props and examples per component.
- `/assets/...` images (flags, portraits) are app-served and absent here; `Avatar` and `CountryFlag` fall back to
  initials / country codes. Pass full image URLs for real pictures.

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
