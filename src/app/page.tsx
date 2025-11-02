"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { QRCodeGeneratorWrapper } from "@/components/qr-code-generator-wrapper";
import { useEffect, useState } from "react";

export default function HomePage() {
  return (
    <main className="container flex-1 py-0 border-0">
      <section className="relative text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
          QRender
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Create, customize, and manage your QR codes instantly.
        </p>
        <div className="mt-6 flex items-center justify-center space-x-4">
          <ThemeToggle />
        </div>
      </section>

      <QRCodeGeneratorWrapper isUserLoggedIn={false} />
    </main>
  );
}
