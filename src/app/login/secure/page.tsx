'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import AppleAuthLayoutComplete from '@/components/auth/AppleAuthLayoutComplete';
import SecureLoginForm from '@/components/auth/SecureLoginForm';
import MFAVerificationModal from '@/components/auth/MFAVerificationModal';

// SISDAT Logo Component for institutional branding
const SisdatLogo = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <Shield className="w-6 h-6" />
  </div>
);

export default function SecureLoginPage() {
  const [showMFA, setShowMFA] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');

  const handleMFARequired = (token: string) => {
    setSessionToken(token);
    setShowMFA(true);
  };

  const handleMFASuccess = () => {
    setShowMFA(false);
    // Navigation to dashboard is handled within MFAVerificationModal
  };

  const handleMFAClose = () => {
    setShowMFA(false);
    setSessionToken('');
  };

  return (
    <>
      <AppleAuthLayoutComplete>
        <SecureLoginForm 
          onMFARequired={handleMFARequired}
          institutionalLogo={SisdatLogo}
        />
      </AppleAuthLayoutComplete>

      {/* MFA Modal Overlay */}
      <MFAVerificationModal
        isOpen={showMFA}
        sessionToken={sessionToken}
        onClose={handleMFAClose}
        onSuccess={handleMFASuccess}
      />
    </>
  );
}