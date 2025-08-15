import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña - SISDAT-forecast',
  description: 'Recupere el acceso a su cuenta de SISDAT-forecast de forma segura',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}