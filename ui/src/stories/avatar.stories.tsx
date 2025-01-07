import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof Avatar>;

// Basic Avatar with Image
export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// Avatar with Fallback
export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

// Avatar with Failed Image Load
export const WithFailedImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="invalid-image-url.jpg" alt="Invalid Image" />
      <AvatarFallback>404</AvatarFallback>
    </Avatar>
  ),
};

// Custom Sized Avatar
export const CustomSize: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src="https://github.com/shadcn.png" alt="Large Avatar" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="Default Avatar" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://github.com/shadcn.png" alt="Small Avatar" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
    </div>
  ),
};

// Custom Styled Avatar
export const CustomStyled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="bg-primary">
        <AvatarFallback className="text-primary-foreground">P</AvatarFallback>
      </Avatar>
      <Avatar className="bg-secondary">
        <AvatarFallback className="text-secondary-foreground">S</AvatarFallback>
      </Avatar>
      <Avatar className="bg-accent">
        <AvatarFallback className="text-accent-foreground">A</AvatarFallback>
      </Avatar>
    </div>
  ),
}; 