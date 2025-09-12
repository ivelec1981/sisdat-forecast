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
  const [userEmail, setUserEmail] = useState<string>('');

  const handleMFARequired = (token: string, email: string) => {
    console.log('🔐 MFA Required - Main Page:', { token, email, showMFA: false });
    setSessionToken(token);
    setUserEmail(email);
    setShowMFA(true);
    console.log('🔐 MFA State Updated:', { showMFA: true, sessionToken: token, userEmail: email });
  };

  const handleMFASuccess = () => {
    console.log('✅ MFA Success - Main Page: Closing modal');
    setShowMFA(false);
    // Navigation to dashboard is handled within MFAVerificationModal
  };

  const handleMFAClose = () => {
    console.log('❌ MFA Close - Main Page: User cancelled or error');
    setShowMFA(false);
    setSessionToken('');
    setUserEmail('');
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
        userEmail={userEmail}
        onClose={handleMFAClose}
        onSuccess={handleMFASuccess}
      />
    </>
  );
}