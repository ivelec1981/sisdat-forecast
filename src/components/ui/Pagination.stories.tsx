import type { Meta, StoryObj } from '@storybook/react';
import Pagination from './Pagination';

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente de paginación con controles para navegar entre páginas de datos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'Página actual',
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      description: 'Total de páginas',
    },
    totalItems: {
      control: { type: 'number', min: 0 },
      description: 'Total de elementos',
    },
    itemsPerPage: {
      control: { type: 'select' },
      options: [10, 25, 50, 100],
      description: 'Elementos por página',
    },
  },
  args: {
    onPageChange: () => {},
    onNextPage: () => {},
    onPreviousPage: () => {},
    onFirstPage: () => {},
    onLastPage: () => {},
    onItemsPerPageChange: () => {},
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 250,
    itemsPerPage: 25,
    hasNextPage: true,
    hasPreviousPage: false,
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    totalItems: 250,
    itemsPerPage: 25,
    hasNextPage: true,
    hasPreviousPage: true,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    totalItems: 250,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPreviousPage: true,
  },
};

export const LargeDataset: Story = {
  args: {
    currentPage: 50,
    totalPages: 200,
    totalItems: 10000,
    itemsPerPage: 50,
    hasNextPage: true,
    hasPreviousPage: true,
  },
};

export const SmallDataset: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    totalItems: 28,
    itemsPerPage: 10,
    hasNextPage: true,
    hasPreviousPage: true,
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 5,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 150,
    totalPages: 500,
    totalItems: 25000,
    itemsPerPage: 50,
    hasNextPage: true,
    hasPreviousPage: true,
  },
};