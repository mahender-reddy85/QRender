import { getQrHistory } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { getSessionUserId } from '@/lib/auth';
import Link from 'next/link';
import { QRCodeCard } from './qr-code-card';

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const qrHistory = await getQrHistory();

  return (
    <main className="container flex-1 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your QR Code History</h1>
        <Button asChild>
          <Link href="/">Create New QR Code</Link>
        </Button>
      </div>

      {qrHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't created any QR codes yet.</p>
          <Button asChild>
            <Link href="/">Create Your First QR Code</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrHistory.map((qr) => (
            <QRCodeCard key={qr.id} qr={qr} />
          ))}
        </div>
      )}
    </main>
  );
}
