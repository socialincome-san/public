import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

// Default Badge
export const Default: Story = {
  render: () => <Badge>Default Badge</Badge>,
};

// All Variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="muted">Muted</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// Interactive States
export const Interactive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge className="cursor-pointer">Clickable Badge</Badge>
      <Badge className="cursor-pointer" variant="secondary">Clickable Secondary</Badge>
      <Badge className="cursor-pointer" variant="destructive">Clickable Destructive</Badge>
    </div>
  ),
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge>
        <span className="mr-1">●</span> Online
      </Badge>
      <Badge variant="secondary">
        New <span className="ml-1">+</span>
      </Badge>
      <Badge variant="destructive">
        <span className="mr-1">⚠</span> Critical
      </Badge>
    </div>
  ),
};

// Custom Styled
export const CustomStyled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge className="bg-blue-500 hover:bg-blue-600">Custom Blue</Badge>
      <Badge className="bg-green-500 hover:bg-green-600">Custom Green</Badge>
      <Badge className="border-2">Custom Border</Badge>
      <Badge className="rounded-lg">Custom Rounded</Badge>
    </div>
  ),
};

// Different Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge className="text-xs py-0 px-2">Small</Badge>
      <Badge>Default</Badge>
      <Badge className="text-sm py-1 px-3">Large</Badge>
      <Badge className="text-base py-1.5 px-4">Extra Large</Badge>
    </div>
  ),
}; 