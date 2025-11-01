import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    </main>
  );
}
