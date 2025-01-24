import type { Meta, StoryObj } from '@storybook/react';
import { linkCn } from '../components/typography/links';

const meta = {
  title: 'Typography/Links',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
interface LinkStoryProps {
  children: string;
  variant?: 'default' | 'muted' | 'nav' | 'footer' | 'accent' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '4xl';
  underline?: 'none' | 'hover' | 'always';
  icon?: boolean;
  arrow?: boolean;
}

type Story = StoryObj<typeof meta & { args: LinkStoryProps }>;

const Template = () => {
  return (
    <div className="flex flex-col space-y-8 p-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Default Links</h3>
        <div className="space-x-4">
          <a href="#" className={linkCn()}>Default Link</a>
          <a href="#" className={linkCn({ underline: 'hover' })}>Hover Underline</a>
          <a href="#" className={linkCn({ underline: 'always' })}>Always Underline</a>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Link Variants</h3>
        <div className="space-x-4">
          <a href="#" className={linkCn({ variant: 'default' })}>Default</a>
          <a href="#" className={linkCn({ variant: 'muted' })}>Muted</a>
          <a href="#" className={linkCn({ variant: 'nav' })}>Nav</a>
          <a href="#" className={linkCn({ variant: 'footer' })}>Footer</a>
          <a href="#" className={linkCn({ variant: 'accent' })}>Accent</a>
          <a href="#" className={linkCn({ variant: 'destructive' })}>Destructive</a>
          <a href="#" className={linkCn({ variant: 'ghost' })}>Ghost</a>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Link Sizes</h3>
        <div className="space-x-4">
          <a href="#" className={linkCn({ size: 'sm' })}>Small</a>
          <a href="#" className={linkCn({ size: 'md' })}>Medium</a>
          <a href="#" className={linkCn({ size: 'lg' })}>Large</a>
          <a href="#" className={linkCn({ size: 'xl' })}>Extra Large</a>
          <a href="#" className={linkCn({ size: '4xl' })}>4XL</a>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Icons</h3>
        <div className="space-x-4">
          <a href="#" className={linkCn({ icon: true })}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Link with Icon
          </a>
          <a href="#" className={linkCn({ variant: 'accent', icon: true })}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Accent Link with Icon
          </a>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Arrows</h3>
        <div className="space-x-4">
          <a href="#" className={linkCn({ arrow: true })}>Default with Arrow</a>
          <a href="#" className={linkCn({ variant: 'accent', arrow: true })}>Accent with Arrow</a>
          <a href="#" className={linkCn({ variant: 'muted', arrow: true })}>Muted with Arrow</a>
          <a href="#" className={linkCn({ size: 'lg', arrow: true })}>Large with Arrow</a>
        </div>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: Template,
};

export const WithControls: Story = {
  args: {
    children: 'Interactive Link',
    variant: 'default',
    size: 'md',
    underline: 'none',
    icon: false,
    arrow: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'nav', 'footer', 'accent', 'destructive', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '4xl'],
    },
    underline: {
      control: 'select',
      options: ['none', 'hover', 'always'],
    },
    icon: {
      control: 'boolean',
    },
    arrow: {
      control: 'boolean',
    },
  },
  render: (args) => (
    <div className="p-8">
      <a
        href="#"
        className={linkCn({
          variant: args.variant,
          size: args.size,
          underline: args.underline,
          icon: args.icon,
          arrow: args.arrow,
        })}
      >
        {args.icon && (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        )}
        {args.children}
      </a>
    </div>
  ),
};
