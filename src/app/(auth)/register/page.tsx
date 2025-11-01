import { RegisterForm } from '@/components/auth/register-form';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
