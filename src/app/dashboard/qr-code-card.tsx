'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from 'lucide-react';
import { deleteQrCode } from '@/lib/actions';
import { QRCodeData } from '@/lib/definitions';
import Image from 'next/image';
import { format } from 'date-fns';

export function QRCodeCard({ qr }: { qr: QRCodeData }) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this QR code?')) {
      await deleteQrCode(qr.id);
    }
  };

  // Generate QR code URL for display
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr.text)}&size=${qr.size}x${qr.size}&color=${qr.color.substring(1)}&bgcolor=F0F0F0`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${qr.text.slice(0,20).replace(/\s/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{qr.text}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Created: {format(new Date(qr.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <Image
            src={qrApiUrl}
            alt={`QR Code for ${qr.text}`}
            width={150}
            height={150}
            className="rounded-lg"
            unoptimized
          />
          <div className="text-sm text-muted-foreground space-y-1 w-full">
            <p><strong>Type:</strong> {qr.type}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
