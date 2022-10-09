# Contributions to the Social Income UI package

There are several ways to contribute to the Social Income UI project:

1. Submit GitHub issues related to current components e.g. if you are
   facing a problem while using the socialincome.org website.
2. Fix bugs you find by submitting merge requests.
3. Help develop new UI elements or improve the current one by creating a
   GitHub issue and suggesting your changes.

## Developing new UI components

At this moment the design/component system of Social Income
is very much a work-in-progress as we move away from a proprietary
licensed third-party UI library. Therefore, when creating new
components bring up your suggestions as a GitHub issue first so we can
validate your idea against our design principles, which might not be
fully documented at this point.

**We strive to make the Social Income platforms and services as
inclusive as possible**. The following guidelines should be applied to
UI elements:

- They are easy to use.
- They use standard and valid HTML.
- They are accessible, based on a minimum of
  [WCAG AA](https://www.w3.org/WAI/standards-guidelines/wcag/).
- Progressive enhancement: They should work for older computers and
  browsers, even though they might not look as nice as in modern
  browsers.

### Adding a new UI component

**General guidelines**:

- Make your component as generic as possible so it can be used in
  different scenarios.
- Prefix components with `So<ComponentName>`.
- Prefix CSS classes with `so-<component-name>`.
- Use [BEM Style](https://en.bem.info/methodology/css/) if you write
  custom CSS.
- Use Tailwind classes or `@apply` in CSS, whichever seems easier to
  read/maintain.
- Use Typescript types (in `.tsx`) to define properties of a component.
- Document components in such a way that others understand its meaning and usage.

**How to get started**:

1. Create a subfolder `ui/src/components/<component-name>`.
2. Develop your component as a React functional component that takes
   inputs and gives outputs.

   **Example**:

   ```tsx
   export const SoExampleComponent = ({
   	children,
   	exampleProperty,
   	...props
   }: SoExampleComponentProps) => {
   	return (
   		<p example-property={exampleProperty} {...props}>
   			{children}
   		</p>
   	);
   };
   ```

3. Add a Storybook
   [Story](https://storybook.js.org/docs/react/writing-stories/introduction)
   for your component and add
   [additional documentation](https://storybook.js.org/docs/react/writing-docs/introduction)
   if necessary.

Check out other components for more ideas on how to create yours.
