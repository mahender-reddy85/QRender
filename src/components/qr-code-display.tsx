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
  frame?: string;
  shape?: string;
};

export function QRCodeDisplay({ imageUrl, text, frame, shape }: QRCodeDisplayProps) {
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

  const getFrameClass = (frame?: string) => {
    switch (frame) {
      case 'bubble-top':
        return 'relative before:content-[""] before:absolute before:top-[-40px] before:left-1/2 before:transform before:-translate-x-1/2 before:bg-white before:px-3 before:py-2 before:rounded-full before:shadow-lg before:border-2 before:border-gray-300 before:flex before:items-center before:justify-center before:text-sm before:font-bold before:text-gray-700 before:min-w-[100px] before:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'w-4 h-4 mr-1\'%3E%3Cpath d=\'M23 4v6h-6\'/%3E%3Cpath d=\'M20.49 15c-1.51 0-2.11-.9-2.11-2.35 0-.81.29-1.49.77-2.35.48-.86 1.19-1.81 2.11-2.27\'/%3E%3Cpath d=\'M1 4v6h6\'/%3E%3Cpath d=\'M3.51 15c1.51 0 2.11-.9 2.11-2.35 0-.81-.29-1.49-.77-2.35C4.37 9.45 3.66 8.5 2.74 8.04\'/%3E%3Cpath d=\'M20.49 9c-1.51 0-2.11.9-2.11 2.35 0 .81.29 1.49.77 2.35.48.86 1.19 1.81 2.11 2.27\'/%3E%3Cpath d=\'M3.51 9c1.51 0 2.11-.9 2.11-2.35 0-.81-.29-1.49-.77-2.35C4.37 3.45 3.66 2.5 2.74 1.96\'/%3E%3C/svg%3E")] before:bg-no-repeat before:bg-left before:bg-[length:16px_16px] before:pl-5';
      case 'bubble-bottom':
        return 'relative after:content-[""] after:absolute after:bottom-[-40px] after:left-1/2 after:transform after:-translate-x-1/2 after:bg-white after:px-3 after:py-2 after:rounded-full after:shadow-lg after:border-2 after:border-gray-300 after:flex after:items-center after:justify-center after:text-sm after:font-bold after:text-gray-700 after:min-w-[100px] after:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'w-4 h-4 mr-1\'%3E%3Cpath d=\'M23 4v6h-6\'/%3E%3Cpath d=\'M20.49 15c-1.51 0-2.11-.9-2.11-2.35 0-.81.29-1.49.77-2.35.48-.86 1.19-1.81 2.11-2.27\'/%3E%3Cpath d=\'M1 4v6h6\'/%3E%3Cpath d=\'M3.51 15c1.51 0 2.11-.9 2.11-2.35 0-.81-.29-1.49-.77-2.35C4.37 9.45 3.66 8.5 2.74 8.04\'/%3E%3Cpath d=\'M20.49 9c-1.51 0-2.11.9-2.11 2.35 0 .81.29 1.49.77 2.35.48.86 1.19 1.81 2.11 2.27\'/%3E%3Cpath d=\'M3.51 9c1.51 0 2.11-.9 2.11-2.35 0-.81-.29-1.49-.77-2.35C4.37 3.45 3.66 2.5 2.74 1.96\'/%3E%3C/svg%3E")] after:bg-no-repeat after:bg-left after:bg-[length:16px_16px] after:pl-5';
      case 'envelope':
        return 'relative before:content-[""] before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-100 before:to-blue-200 before:rounded-lg before:shadow-xl before:p-4 before:flex before:items-center before:justify-center before:border-2 before:border-blue-300 before:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\'/%3E%3Cpolyline points=\'22,6 12,13 2,6\'/%3E%3C/svg%3E")] before:bg-no-repeat before:bg-center before:bg-[length:32px_32px]';
      case 'arrow':
        return 'relative after:content-[""] after:absolute after:bottom-[-30px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-0 after:border-l-[15px] after:border-r-[15px] after:border-t-[20px] after:border-l-transparent after:border-r-transparent after:border-t-white after:shadow-lg after:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M12 19V5\'/%3E%3Cpath d=\'M5 12l7 7 7-7\'/%3E%3C/svg%3E")] after:bg-no-repeat after:bg-center after:bg-[length:20px_20px] after:bg-white';
      case 'outline':
        return 'border-4 border-black p-2 shadow-2xl bg-white relative before:content-[""] before:absolute before:inset-2 before:border-2 before:border-dashed before:border-gray-400 before:rounded';
      case 'shopping-bag':
        return 'relative before:content-[""] before:absolute before:top-[-50px] before:left-1/2 before:transform before:-translate-x-1/2 before:w-12 before:h-12 before:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4z\'/%3E%3Cline x1=\'3\' y1=\'6\' x2=\'21\' y2=\'6\'/%3E%3Cpath d=\'M16 10a4 4 0 0 1-8 0\'/%3E%3C/svg%3E")] before:bg-contain before:bg-no-repeat before:bg-center before:drop-shadow-lg';
      case 'banner':
        return 'relative before:content-[""] before:absolute before:bottom-0 before:left-0 before:right-0 before:bg-gradient-to-r before:from-red-500 before:to-red-600 before:text-white before:text-center before:py-3 before:px-4 before:font-bold before:shadow-lg before:rounded-b-lg before:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'w-5 h-5 inline mr-1\'%3E%3Cpath d=\'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\'/%3E%3Cline x1=\'4\' y1=\'22\' x2=\'4\' y2=\'15\'/%3E%3C/svg%3E")] before:bg-no-repeat before:bg-left before:bg-[length:20px_20px] before:pl-6';
      case 'video-play':
        return 'relative before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:w-16 before:h-16 before:bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'w-full h-full\'%3E%3Cpolygon points=\'23 7 16 12 23 17 23 7\'/%3E%3Crect x=\'1\' y=\'5\' width=\'15\' height=\'14\' rx=\'2\' ry=\'2\'/%3E%3C/svg%3E")] before:bg-contain before:bg-no-repeat before:bg-center before:opacity-80 before:drop-shadow-xl before:rounded-full before:bg-black';
      default:
        return '';
    }
  };

  const getShapeClass = (shape?: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'square':
        return '';
      default:
        return 'rounded-lg';
    }
  };

  return (
    <Card className="max-w-sm mx-auto w-full animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-center text-lg">QR Code for {text}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex justify-center">
        <div className={cn("relative", getFrameClass(frame))}>
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
