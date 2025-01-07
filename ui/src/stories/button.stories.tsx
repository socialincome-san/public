import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/button';
import { 
  ChevronRightIcon, 
  TrashIcon, 
  PlusIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// Basic Variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" variant="ghost">
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  ),
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button Icon={ChevronRightIcon}>Continue</Button>
      <Button variant="destructive" Icon={TrashIcon}>Delete</Button>
      <Button variant="outline" Icon={PlusIcon}>Add New</Button>
      <Button variant="secondary" Icon={ArrowRightIcon}>Next</Button>
    </div>
  ),
};

// Loading State
export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button showLoadingSpinner>Loading Default</Button>
      <Button variant="secondary" showLoadingSpinner>Loading Secondary</Button>
      <Button variant="outline" showLoadingSpinner>Loading Outline</Button>
    </div>
  ),
};

// Disabled State
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled Default</Button>
      <Button disabled variant="secondary">Disabled Secondary</Button>
      <Button disabled variant="destructive">Disabled Destructive</Button>
      <Button disabled variant="outline">Disabled Outline</Button>
    </div>
  ),
};

// Icon Only Buttons
export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button size="icon" variant="default">
        <PlusIcon className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="secondary">
        <TrashIcon className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline">
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  ),
};

// Combined Features
export const Combined: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button size="lg" Icon={PlusIcon} variant="default">
        Create New
      </Button>
      <Button size="sm" Icon={TrashIcon} variant="destructive" disabled>
        Delete Item
      </Button>
      <Button showLoadingSpinner variant="secondary">
        Saving...
      </Button>
    </div>
  ),
}; 