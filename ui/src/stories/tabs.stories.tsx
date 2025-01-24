import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';
import { ChatBubbleLeftIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const meta = {
	title: 'Components/Tabs',
	component: Tabs,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A fully accessible tab component built on Radix UI primitives.

Component Structure:
- TabsList: Container for tab triggers, manages tab organization
- TabsTrigger: Interactive button that activates its associated content panel
- TabsContent: Content panel that's shown when its associated trigger is active
`,
			},
		},
		controls: {
			exclude: ['dir', 'asChild', 'orientation']
		}
	},
	argTypes: {
		defaultValue: {
			control: 'text',
			description: 'The value of the tab that should be active when initially rendered',
			type: { name: 'string', required: true },
		},
		value: {
			control: 'text',
			description: 'The controlled value of the tab to activate',
		},
		onValueChange: {
			description: 'Event handler called when the value changes',
			action: 'changed',
			table: {
				disable: true,
			}
		},
		className: {
			control: 'text',
			description: 'Optional CSS class to add to the component',
			table: {
				category: 'Styling',
			},
		},
		dir: {
			table: {
				disable: true
			}
		}
	},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;
// First, define an interface for the additional props
interface BasicStoryProps extends React.ComponentProps<typeof Tabs> {
	tab1Label?: string;
	tab2Label?: string;
	tab1Content?: string;
	tab2Content?: string;
}

export const Basic: StoryObj<BasicStoryProps> = {
	args: {
		defaultValue: 'tab1',
		tab1Label: 'Tab 1',
		tab2Label: 'Tab 2',
	},
	parameters: {
		docs: {
			description: {
				story: 'Basic usage of the Tabs component demonstrating core functionality.',
			},
		},
	},
	argTypes: {
		tab1Label: {
			control: 'text',
			description: 'Label for the first tab',
		} as const,
		tab2Label: {
			control: 'text',
			description: 'Label for the second tab',
		} as const,
		tab1Content: {
			control: 'text',
			description: 'Content for the first tab',
		} as const,
		tab2Content: {
			control: 'text',
			description: 'Content for the second tab',
		} as const,
	},
	render: ({ tab1Label = 'Tab 1', tab2Label = 'Tab 2', tab1Content = 'Content for Tab 1', tab2Content = 'Content for Tab 2', ...args }) => (
		<Tabs {...args}>
			<TabsList>
				<TabsTrigger value="tab1">{tab1Label}</TabsTrigger>
				<TabsTrigger value="tab2">{tab2Label}</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">{tab1Content}</TabsContent>
			<TabsContent value="tab2">{tab2Content}</TabsContent>
		</Tabs>
	),
};

interface StyledStoryProps extends React.ComponentProps<typeof Tabs> {
	listClassName?: string;
	triggerClassName?: string;
	contentClassName?: string;
}


export const Styled: StoryObj<StyledStoryProps>
	= {
	args: {
		defaultValue: 'tab1',
		listClassName: 'bg-gray-100 p-2 rounded-lg',
		triggerClassName: 'px-4 py-2',
		contentClassName: 'p-4 bg-white rounded-lg mt-2',
	},
	parameters: {
		docs: {
			description: {
				story: 'Example demonstrating styling options and disabled state.',
			},
		},
	},
	argTypes: {
		listClassName: {
			control: 'text',
			description: 'Custom class for TabsList',
		},
		triggerClassName: {
			control: 'text',
			description: 'Custom class for TabsTrigger',
		},
		contentClassName: {
			control: 'text',
			description: 'Custom class for TabsContent',
		},
	},
	render: ({ listClassName, triggerClassName, contentClassName, ...args }) => (
		<Tabs {...args}>
			<TabsList className={listClassName}>
				<TabsTrigger value="tab1" className={triggerClassName}>Active</TabsTrigger>
				<TabsTrigger value="tab2" className={triggerClassName}>Settings</TabsTrigger>
				<TabsTrigger value="tab3" className={triggerClassName} disabled>Disabled</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1" className={contentClassName}>
				Active tab content with custom styling
			</TabsContent>
			<TabsContent value="tab2" className={contentClassName}>
				Settings tab content with custom styling
			</TabsContent>
			<TabsContent value="tab3" className={contentClassName}>
				Disabled tab content
			</TabsContent>
		</Tabs>
	),
};

interface FullWidthStoryProps extends React.ComponentProps<typeof Tabs> {
	gap?: number;
}

export const FullWidth: StoryObj<FullWidthStoryProps> = {
	args: {
		defaultValue: 'tab1',
		className: 'w-full',
		gap: 2,
	},
	parameters: {
		docs: {
			description: {
				story: 'A full-width layout with evenly distributed tabs.',
			},
		},
	},
	argTypes: {
		gap: {
			control: { type: 'range', min: 0, max: 8 },
			description: 'Gap between tabs (in Tailwind spacing units)',
		},
	},
	render: ({ gap = 2, ...args }) => (
		<Tabs {...args}>
			<TabsList className={`w-full flex justify-between gap-${gap}`}>
				<TabsTrigger value="tab1" className="flex-1">Messages</TabsTrigger>
				<TabsTrigger value="tab2" className="flex-1">Notifications</TabsTrigger>
				<TabsTrigger value="tab3" className="flex-1">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">Messages panel content</TabsContent>
			<TabsContent value="tab2">Notifications panel content</TabsContent>
			<TabsContent value="tab3">Settings panel content</TabsContent>
		</Tabs>
	),
};

interface WithIconsStoryProps extends React.ComponentProps<typeof Tabs> {
	iconSize?: number;
}

export const WithIcons: StoryObj<WithIconsStoryProps> = {
	args: {
		defaultValue: 'messages',
		iconSize: 16,
	},
	parameters: {
		docs: {
			description: {
				story: 'Example of tabs with HeroIcons integration.',
			},
		},
	},
	argTypes: {
		iconSize: {
			control: { type: 'range', min: 12, max: 24 },
			description: 'Size of the icons in pixels',
		},
	},
	render: ({ iconSize = 16, ...args }) => (
		<Tabs {...args}>
			<TabsList>
				<TabsTrigger value="messages" className="flex items-center gap-2">
					<ChatBubbleLeftIcon style={{ width: iconSize, height: iconSize }} />
					Messages
				</TabsTrigger>
				<TabsTrigger value="settings" className="flex items-center gap-2">
					<Cog6ToothIcon style={{ width: iconSize, height: iconSize }} />
					Settings
				</TabsTrigger>
			</TabsList>
			<TabsContent value="messages">Messages panel with icon example</TabsContent>
			<TabsContent value="settings">Settings panel with icon example</TabsContent>
		</Tabs>
	),
};


export const WithRichContent: Story = {
	args: {
		defaultValue: 'profile',
	},
	parameters: {
		docs: {
			description: {
				story: 'Example of tabs with rich content and configurable spacing.',
			},
		},
	},
	render: (args) => (
		<Tabs {...args}>
			<TabsList>
				<TabsTrigger value="profile">Profile</TabsTrigger>
				<TabsTrigger value="notifications">Notifications</TabsTrigger>
			</TabsList>
			<TabsContent value="profile" className={`space-y-4`}>
				<h3 className="text-lg font-medium">Profile Settings</h3>
					<p className="text-muted-foreground text-sm">
						Update your profile information and preferences.
					</p>
				<input
					type="text"
					placeholder="Display Name"
					className="flex h-10 w-full rounded-md border px-3"
				/>
			</TabsContent>
			<TabsContent value="notifications" className={`space-y-4`}>
				<h3 className="text-lg font-medium">Notification Settings</h3>
					<p className="text-muted-foreground text-sm">
						Choose how you want to be notified.
					</p>
				<div className="flex items-center space-x-2">
					<input type="checkbox" id="emailNotifications" />
					<label htmlFor="emailNotifications">Email notifications</label>
				</div>
			</TabsContent>
		</Tabs>
	),
};
