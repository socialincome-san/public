import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table';

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof Table>;

// Basic Table
export const Basic: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// With Caption
export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of recent users and their roles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// With Footer
export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Product A</TableCell>
          <TableCell className="text-right">2</TableCell>
          <TableCell className="text-right">$20.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product B</TableCell>
          <TableCell className="text-right">1</TableCell>
          <TableCell className="text-right">$15.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">3</TableCell>
          <TableCell className="text-right">$35.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// Custom Styled
export const CustomStyled: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="font-bold">Product</TableHead>
          <TableHead className="font-bold text-right">Stock</TableHead>
          <TableHead className="font-bold text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-blue-50">
          <TableCell className="font-medium">Product A</TableCell>
          <TableCell className="text-right">32</TableCell>
          <TableCell className="text-right">$20.00</TableCell>
        </TableRow>
        <TableRow className="hover:bg-blue-50">
          <TableCell className="font-medium">Product B</TableCell>
          <TableCell className="text-right">12</TableCell>
          <TableCell className="text-right">$15.00</TableCell>
        </TableRow>
        <TableRow className="hover:bg-blue-50">
          <TableCell className="font-medium">Product C</TableCell>
          <TableCell className="text-right">4</TableCell>
          <TableCell className="text-right">$25.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// With Status Column
export const WithStatusColumn: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">#123</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          </TableCell>
          <TableCell>2 hours ago</TableCell>
          <TableCell className="text-right">$25.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">#124</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </TableCell>
          <TableCell>3 hours ago</TableCell>
          <TableCell className="text-right">$42.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">#125</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
              Failed
            </span>
          </TableCell>
          <TableCell>5 hours ago</TableCell>
          <TableCell className="text-right">$15.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}; 