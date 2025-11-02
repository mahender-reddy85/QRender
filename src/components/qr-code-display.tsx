'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type QRCodeDisplayProps = {
  imageUrl: string;
  text: string;
  shape?: string;
};

export function QRCodeDisplay({ imageUrl, text, shape }: QRCodeDisplayProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use a proxy fetch if direct download is blocked by CORS.
      // For api.qrserver.com, direct fetch works.
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Network response was not ok.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${text.slice(0,20).replace(/\s/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast({
        title: 'Download Started',
        description: 'Your QR code is being downloaded.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not download the QR code image.',
      });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: 'QR code image URL has been copied.',
      });
    }, () => {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy the URL.',
      });
    });
  };



  const getShapeClass = (shape?: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return '';
      default:
        return '';
    }
  };

  return (
    <Card className="max-w-sm mx-auto w-full animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-center text-lg">QR Code for {text}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex justify-center">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={`QR Code for ${text}`}
            width={300}
            height={300}
            className={cn("rounded-lg", getShapeClass(shape))}
            unoptimized // Required for external URLs that aren't in next.config.js remotePatterns
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleDownload} className="w-full" disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
        <Button onClick={handleCopy} variant="outline" className="w-full">
          <Copy className="mr-2 h-4 w-4" />
          Copy URL
        </Button>
      </CardFooter>
    </Card>
  );
}
