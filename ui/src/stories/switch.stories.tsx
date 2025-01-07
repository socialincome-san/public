import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../components/switch';
import { Label } from '../components/label';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

// Basic Switch
export const Basic: Story = {
  render: () => <Switch />,
};

// With Label
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

// Disabled State
export const DisabledState: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked" className="text-muted-foreground">
          Disabled (Unchecked)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked" className="text-muted-foreground">
          Disabled (Checked)
        </Label>
      </div>
    </div>
  ),
};

// With Form
export const WithForm: Story = {
  render: () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Handle form submission
    }}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Notification Settings</h4>
          <div className="flex items-center space-x-2">
            <Switch id="email-notifications" />
            <Label htmlFor="email-notifications">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="push-notifications" />
            <Label htmlFor="push-notifications">Push notifications</Label>
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Save Settings
        </button>
      </div>
    </form>
  ),
};

// Custom Styled
export const CustomStyled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          className="data-[state=checked]:bg-green-500"
          id="green-switch"
        />
        <Label htmlFor="green-switch">Green Switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          className="data-[state=checked]:bg-blue-500"
          id="blue-switch"
        />
        <Label htmlFor="blue-switch">Blue Switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          className="data-[state=checked]:bg-purple-500 h-6 w-11"
          id="large-switch"
        />
        <Label htmlFor="large-switch">Large Switch</Label>
      </div>
    </div>
  ),
};

// Interactive Example
export const InteractiveExample: Story = {
  render: () => {
    const [isEnabled, setIsEnabled] = React.useState(false);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="interactive-switch"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="interactive-switch">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Current state: {isEnabled ? 'On' : 'Off'}
        </p>
      </div>
    );
  },
}; 