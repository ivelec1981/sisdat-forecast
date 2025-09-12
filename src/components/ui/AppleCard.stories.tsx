import type { Meta, StoryObj } from '@storybook/react';
import { AppleCard } from './AppleCard';
import { Heart, Share, MoreHorizontal, Star } from 'lucide-react';

const meta = {
  title: 'UI/AppleCard',
  component: AppleCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Una tarjeta con diseño inspirado en el estilo de Apple, elegante y minimalista.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
    children: {
      description: 'Contenido de la tarjeta',
    },
  },
} satisfies Meta<typeof AppleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Tarjeta Simple</h3>
        <p className="text-gray-600">
          Esta es una tarjeta básica con contenido simple.
        </p>
      </div>
    ),
  },
};

export const WithImage: Story = {
  args: {
    children: (
      <div>
        <img
          src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop"
          alt="Ejemplo"
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Dashboard Analytics</h3>
          <p className="text-gray-600 mb-4">
            Visualiza tus métricas de forma elegante y efectiva.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Actualizado hoy</span>
            <div className="flex gap-2">
              <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />
              <Share className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

export const ProductCard: Story = {
  args: {
    children: (
      <div>
        <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold">Premium Analytics</h3>
            <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
          <p className="text-gray-600 mb-4">
            Análisis avanzado con IA para maximizar tus resultados.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">$49/mes</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Obtener
            </button>
          </div>
        </div>
      </div>
    ),
  },
};

export const MetricCard: Story = {
  args: {
    children: (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Usuarios Activos
          </h3>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold">24,531</span>
          <span className="text-sm font-medium text-green-600">+12.5%</span>
        </div>
        <p className="text-sm text-gray-600">
          vs. mes anterior
        </p>
      </div>
    ),
  },
};

export const NotificationCard: Story = {
  args: {
    children: (
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">Nueva actualización disponible</h4>
            <p className="text-sm text-gray-600 mb-2">
              SISDAT-forecast v2.1.0 incluye mejoras de rendimiento y nuevas características.
            </p>
            <div className="flex gap-2">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Actualizar ahora
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-600">
                Más tarde
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

export const CustomShadow: Story = {
  args: {
    className: 'shadow-xl',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Sombra Personalizada</h3>
        <p className="text-gray-600">
          Esta tarjeta tiene una sombra más pronunciada.
        </p>
      </div>
    ),
  },
};