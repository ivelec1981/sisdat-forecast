'use client';

import AppleAuthLayout from '@/components/auth/AppleAuthLayout';
import AppleLoginForm from '@/components/auth/AppleLoginForm';

export default function AppleLoginPage() {
  return (
    <AppleAuthLayout>
      <AppleLoginForm />
    </AppleAuthLayout>
  );
}