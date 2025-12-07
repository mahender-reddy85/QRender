'use client';

import { Suspense } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import { GradientText } from "@/components/ui/gradient-text";
import dynamic from 'next/dynamic';

// Create a client component that will be rendered on the client
function QRCodeGeneratorClient() {
  const QRCodeGenerator = dynamic<{}>(
    () => import('@/components/qr-code-generator').then(mod => mod.QRCodeGenerator),
    { 
      ssr: false, 
      loading: () => <div>Loading QR Code Generator...</div> 
    }
  );

  return <QRCodeGenerator />;
}

export default function HomePage() {
  return (
    <main className="container flex-1 py-8 border-0">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <section className="relative text-center mb-8">
        <GradientText 
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4"
        >
          QRender
        </GradientText>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Create, customize, and manage your QR codes instantly.
        </p>
      </section>

      <Suspense fallback={<div>Loading QR Code Generator...</div>}>
        <QRCodeGeneratorClient />
      </Suspense>
    </main>
  );
}
