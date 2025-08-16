import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - SISDAT-forecast',
  description: 'Acceda a la plataforma de proyección de demanda eléctrica de Ecuador',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}