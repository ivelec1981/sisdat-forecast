import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña - SISDAT-forecast',
  description: 'Establezca una nueva contraseña segura para su cuenta de SISDAT-forecast',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}