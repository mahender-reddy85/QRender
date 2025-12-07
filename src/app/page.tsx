'use client';

import { Suspense } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from 'next/dynamic';

const QRCodeGenerator = dynamic(
  () => import('@/components/qr-code-generator').then((mod) => mod.QRCodeGenerator),
  { ssr: false, loading: () => <div>Loading QR Code Generator...</div> }
);

export default function HomePage() {
  return (
    <main className="container flex-1 py-8 border-0">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <section className="relative text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
          QRender
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Create, customize, and manage your QR codes instantly.
        </p>
      </section>

      <Suspense fallback={<div>Loading QR Code Generator...</div>}>
        <QRCodeGenerator />
      </Suspense>
    </main>
  );
}
