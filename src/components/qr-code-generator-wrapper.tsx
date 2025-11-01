'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const QRCodeGenerator = dynamic(() => import('@/components/qr-code-generator').then(mod => ({ default: mod.QRCodeGenerator })), { ssr: false });

interface QRCodeGeneratorWrapperProps {
  isUserLoggedIn: boolean;
}

export function QRCodeGeneratorWrapper({ isUserLoggedIn }: QRCodeGeneratorWrapperProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRCodeGenerator isUserLoggedIn={isUserLoggedIn} />
    </Suspense>
  );
}
