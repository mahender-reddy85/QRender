"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionUserId } from "@/lib/auth";
import { QRCodeGeneratorWrapper } from "@/components/qr-code-generator-wrapper";
import { MobileHeader, MobileAuthButtons } from "@/components/mobile-header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getSessionUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  return (
    <main className="container flex-1 py-0 border-0">
      <section className="relative text-center">
        {!isMobile && (
          <>
            {!userId && (
              <div className="absolute right-0 flex items-center space-x-2 top-0">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
          QRender
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Create, customize, and manage your QR codes instantly.
        </p>
        <MobileHeader userId={userId} />
      </section>

      <QRCodeGeneratorWrapper isUserLoggedIn={!!userId} />
    </main>
  );
}
