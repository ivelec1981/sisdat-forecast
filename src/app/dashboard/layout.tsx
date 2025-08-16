import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - SISDAT-forecast',
  description: 'Panel principal del sistema de proyección de demanda eléctrica',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}