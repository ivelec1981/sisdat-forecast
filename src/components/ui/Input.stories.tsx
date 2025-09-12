import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Mail, Search as SearchIcon, Lock, User } from 'lucide-react';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Un componente de input con soporte para iconos, validación y diferentes estados.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'El tipo de input',
    },
    placeholder: {
      control: 'text',
      description: 'Texto de placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Si el input está deshabilitado',
    },
    error: {
      control: 'text',
      description: 'Mensaje de error',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Ingrese su texto aquí...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Texto ingresado',
    placeholder: 'Placeholder',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'correo@ejemplo.com',
    leftIcon: <Mail className="h-4 w-4" />,
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Ingrese su contraseña',
    leftIcon: <Lock className="h-4 w-4" />,
  },
};

export const WithSearchIcon: Story = {
  args: {
    type: 'text',
    placeholder: 'Buscar...',
    leftIcon: <SearchIcon className="h-4 w-4" />,
  },
};

export const WithIcon: Story = {
  args: {
    placeholder: 'Nombre de usuario',
    leftIcon: <User className="h-4 w-4" />,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Input deshabilitado',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Email inválido',
    error: 'Este campo es requerido',
    value: 'email-invalido',
  },
};

export const WithErrorAndIcon: Story = {
  args: {
    type: 'email',
    placeholder: 'correo@ejemplo.com',
    leftIcon: <Mail className="h-4 w-4" />,
    error: 'Formato de email inválido',
    value: 'email-invalido',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 100,
  },
};

export const LongError: Story = {
  args: {
    placeholder: 'Campo con error largo',
    error: 'Este es un mensaje de error muy largo que debería verse bien en múltiples líneas y no romper el diseño del componente.',
    value: 'valor-invalido',
  },
};