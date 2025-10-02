import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Un componente de botón versátil con múltiples variantes y tamaños.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'La variante visual del botón',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'El tamaño del botón',
    },
    disabled: {
      control: 'boolean',
      description: 'Si el botón está deshabilitado',
    },
    children: {
      control: 'text',
      description: 'El contenido del botón',
    },
  },
  args: { onClick: () => {} },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🔍',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

export const LoadingState: Story = {
  args: {
    disabled: true,
    children: (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    ),
  },
};