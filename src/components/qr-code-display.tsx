'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Download, Share2, Loader2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type QRCodeDisplayProps = {
  imageUrl: string;
  text?: string;
  className?: string;
  showActions?: boolean;
  onCreateAnother?: () => void;
};

export function QRCodeDisplay({ 
  imageUrl, 
  text, 
  className = '',
  showActions = true,
  onCreateAnother = () => {}
}: QRCodeDisplayProps) {
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
      a.download = `qrcode-${text ? text.slice(0,20).replace(/\s/g, '_') : 'qrcode'}.png`;
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

  const handleShare = async () => {
    try {
      // First, fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch QR code');
      
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for ${text}`,
          files: [file],
        });
      } else if (navigator.clipboard) {
        // Fallback to copying the image URL
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: 'Link Copied',
          description: 'QR code link has been copied to clipboard.',
        });
      } else {
        throw new Error('Sharing not supported');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      toast({
        variant: 'destructive',
        title: 'Sharing not supported',
        description: 'Your browser does not support sharing this content.',
      });
    }
  };


  return (
    <div className={cn("flex flex-col items-center justify-center space-y-6 p-6 rounded-lg bg-card text-card-foreground shadow-sm border border-border w-full max-w-md mx-auto", className)}>
      <div className="relative p-2 bg-white rounded w-full flex justify-center">
        <Image
          src={imageUrl}
          alt={`QR Code${text ? ` for ${text}` : ''}`}
          className="w-full h-auto max-h-[300px] object-contain"
          width={300}
          height={300}
          unoptimized={imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')}
          onError={(e) => {
            // Fallback to img if Image component fails
            const img = e.target as HTMLImageElement;
            img.onerror = null;
            img.src = imageUrl;
          }}
        />
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground text-center break-words w-full">
          {text}
        </p>
      )}
      
      {showActions && (
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-none sm:px-6"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              <span>Save</span>
            </Button>
            
            <Button
              variant="default"
              onClick={handleShare}
              className="flex-1 sm:flex-none sm:px-6"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span>Share</span>
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={onCreateAnother}
            className="w-full sm:w-auto px-6 mt-2"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Create Another
          </Button>
        </div>
      )}
    </div>
  );
}
