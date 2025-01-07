import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../components/input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

// Basic Input
export const Basic: Story = {
  render: () => <Input placeholder="Basic input" />,
};

// Input Types
export const Types: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone input" />
      <Input type="url" placeholder="URL input" />
      <Input type="search" placeholder="Search input" />
    </div>
  ),
};

// States
export const States: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Input placeholder="Default input" />
      <Input placeholder="Disabled input" disabled />
      <Input placeholder="Read-only input" readOnly />
      <Input placeholder="Required input" required />
    </div>
  ),
};

// With Icon
export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" placeholder="Search..." />
    </div>
  ),
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Input className="h-8 text-sm" placeholder="Small input" />
      <Input placeholder="Default input" />
      <Input className="h-12 text-lg" placeholder="Large input" />
    </div>
  ),
};

// Custom Styled
export const CustomStyled: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Input 
        className="border-primary bg-primary/5 placeholder:text-primary/50" 
        placeholder="Primary styled"
      />
      <Input 
        className="border-secondary bg-secondary/5 placeholder:text-secondary/50" 
        placeholder="Secondary styled"
      />
      <Input 
        className="rounded-full border-2" 
        placeholder="Custom border"
      />
    </div>
  ),
};

// With Label and Error
export const WithLabelAndError: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <Input id="username" placeholder="Enter username" />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter email"
          className="border-destructive" 
        />
        <p className="text-sm text-destructive">Please enter a valid email address</p>
      </div>
    </div>
  ),
};

// With Button
export const WithButton: Story = {
  render: () => (
    <div className="flex space-x-2">
      <Input placeholder="Subscribe to newsletter..." />
      <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2">
        Subscribe
      </button>
    </div>
  ),
}; 