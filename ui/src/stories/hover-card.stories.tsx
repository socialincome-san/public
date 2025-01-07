import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/hover-card';
import { Button } from '../components/button';
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof HoverCard>;

// Basic Hover Card
export const Basic: Story = {
  render: () => (
    <div className="flex items-start justify-center pb-40">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@username</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-secondary p-2">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">@username</h4>
                <p className="text-xs text-muted-foreground">Full Name</p>
              </div>
            </div>
            <p className="text-sm">
              Frontend developer and UI designer. Love creating beautiful user interfaces.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

// With Rich Content
export const RichContent: Story = {
  render: () => (
    <div className="flex items-center justify-center pb-40">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>View Profile</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@johndoe</h4>
              <p className="text-sm">
                The quick brown fox jumps over the lazy dog.
              </p>
              <div className="flex items-center pt-2">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  Joined December 2021
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-secondary" />
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

// Different Positions
export const Positions: Story = {
  render: () => (
    <div className="flex items-center justify-center gap-8 p-16">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>Hover Top</Button>
        </HoverCardTrigger>
        <HoverCardContent side="top">
          <p className="text-sm">This card appears on top</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>Hover Bottom</Button>
        </HoverCardTrigger>
        <HoverCardContent side="bottom">
          <p className="text-sm">This card appears at the bottom</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>Hover Left</Button>
        </HoverCardTrigger>
        <HoverCardContent side="left">
          <p className="text-sm">This card appears on the left</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>Hover Right</Button>
        </HoverCardTrigger>
        <HoverCardContent side="right">
          <p className="text-sm">This card appears on the right</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

// Custom Styled
export const CustomStyled: Story = {
  render: () => (
    <div className="flex items-center justify-center pb-40">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" className="border-primary text-primary">
            Custom Style
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="bg-primary text-primary-foreground w-72">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Custom Styled Card</h4>
            <p className="text-sm opacity-90">
              This hover card has custom background and text colors.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

// With Interactive Content
export const WithInteractiveContent: Story = {
  render: () => (
    <div className="flex items-center justify-center pb-40">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>Interactive Card</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Interactive Content</h4>
              <p className="text-sm text-muted-foreground">
                This card contains interactive elements.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                View Details
              </Button>
              <Button size="sm" variant="outline">
                Dismiss
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}; 