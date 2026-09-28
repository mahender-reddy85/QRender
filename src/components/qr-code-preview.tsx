'use client';

import React from 'react';
import { Button } from './ui/button';
import { Download, RotateCcw, Share2 } from 'lucide-react';
import { QRCodeDisplayProps } from '@/types';

export const QRCodePreview: React.FC<QRCodeDisplayProps> = ({
  imageUrl,
  text,
  className = '',
  onCreateAnother,
}) => {
  const handleDownload = async () => {
    try {

      const link = document.createElement('a');
      

      const fileName = `qr-code-${text || 'download'}.png`;
      link.download = fileName.replace(/[^\w\d.-]/g, '_');
      

      if (imageUrl.includes('api.qrserver.com')) {

        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
        

        const response = await fetch(urlWithTimestamp);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        

        link.href = blobUrl;
        

        document.body.appendChild(link);
        link.click();
        

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 100);
      } else {

        link.href = imageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);

      window.open(imageUrl, '_blank');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: `Check out this QR code for ${text || 'your content'}`,
          url: imageUrl,
        });
      } else {

        await navigator.clipboard.writeText(imageUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      <div className="relative w-64 h-64">
        <img
          src={imageUrl}
          alt={`QR Code for ${text}`}
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button 
          onClick={handleDownload}
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        
        <Button 
          onClick={handleShare}
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        
        {onCreateAnother && (
          <Button 
            variant="outline" 
            onClick={onCreateAnother}
            className="col-span-2 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Create Another</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRCodePreview;
