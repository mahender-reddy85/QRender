import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionUserId } from "@/lib/auth";
import { QRCodeGeneratorWrapper } from "@/components/qr-code-generator-wrapper";

export default async function HomePage() {
  const userId = await getSessionUserId();

  return (
    <main className="container flex-1 py-0 border-0">
      <section className="relative text-center">
        <div className="absolute left-0 top-0">
          <ThemeToggle />
        </div>
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
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
          QRender
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Create, customize, and manage your QR codes instantly.
        </p>
      </section>

      <QRCodeGeneratorWrapper isUserLoggedIn={!!userId} />
    </main>
  );
}
