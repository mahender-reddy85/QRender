'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileHeaderProps {
  userId: string | null;
}

export function MobileHeader({ userId }: MobileHeaderProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return <ThemeToggle />;
}

export function MobileAuthButtons({ userId }: MobileHeaderProps) {
  const isMobile = useIsMobile();

  if (!isMobile || userId) return null;

  return (
    <div className="flex items-center space-x-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
        <Link href="/register">Sign Up</Link>
      </Button>
    </div>
  );
}
