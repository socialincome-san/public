import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>This is a default alert message.</AlertDescription>
    </Alert>
  ),
};

export const Primary: Story = {
  render: () => (
    <Alert variant="primary">
      <InformationCircleIcon className="h-4 w-4" />
      <AlertTitle>Primary Alert</AlertTitle>
      <AlertDescription>This is a primary alert with an icon.</AlertDescription>
    </Alert>
  ),
};

export const Secondary: Story = {
  render: () => (
    <Alert variant="secondary">
      <AlertTitle>Secondary Alert</AlertTitle>
      <AlertDescription>This is a secondary alert message.</AlertDescription>
    </Alert>
  ),
};

export const Accent: Story = {
  render: () => (
    <Alert variant="accent">
      <AlertTitle>Accent Alert</AlertTitle>
      <AlertDescription>This is an accent alert message.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Destructive Alert</AlertTitle>
      <AlertDescription>This is a destructive alert with a warning icon.</AlertDescription>
    </Alert>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <Alert>
      <AlertDescription>This is an alert without a title.</AlertDescription>
    </Alert>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Alert without description</AlertTitle>
    </Alert>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <Alert className="border-blue-500">
      <AlertTitle className="text-blue-700">Custom Styled Alert</AlertTitle>
      <AlertDescription className="text-blue-600">
        This alert has custom styling applied through className props.
      </AlertDescription>
    </Alert>
  ),
}; 