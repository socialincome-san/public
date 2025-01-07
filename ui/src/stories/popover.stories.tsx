import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/popover';
import { Button } from '../components/button';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

// Basic Popover
export const Basic: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// With Form Elements
export const WithFormElements: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Profile</h4>
            <p className="text-sm text-muted-foreground">
              Update your profile information.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                defaultValue="John Doe"
                className="col-span-2 h-8 rounded-md border border-input px-3"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                defaultValue="john@example.com"
                className="col-span-2 h-8 rounded-md border border-input px-3"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// With Custom Delay
export const WithCustomDelay: Story = {
  render: () => (
    <Popover openDelay={500} closeDelay={300}>
      <PopoverTrigger asChild>
        <Button variant="outline">Hover with Delay</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">
          This popover has a custom open delay of 500ms and close delay of 300ms.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

// With Rich Content
export const WithRichContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">View Details</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Product Details</h4>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-md bg-muted" />
              <div>
                <p className="text-sm font-medium">Premium Package</p>
                <p className="text-sm text-muted-foreground">
                  Access to all premium features
                </p>
                <p className="text-sm font-medium text-primary">$99/month</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">Learn More</Button>
            <Button size="sm">Subscribe</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// With Custom Positioning
export const WithCustomPositioning: Story = {
  render: () => (
    <div className="flex items-center justify-center h-48">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={10}
          className="w-[200px]"
        >
          <div className="grid gap-2">
            <Button variant="ghost" className="justify-start">Profile</Button>
            <Button variant="ghost" className="justify-start">Settings</Button>
            <Button variant="ghost" className="justify-start">Logout</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
}; 