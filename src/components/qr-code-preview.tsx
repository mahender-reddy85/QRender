'use client';

import React from 'react';
import { Button } from './ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { QRCodeDisplayProps } from '@/types';

export const QRCodePreview: React.FC<QRCodeDisplayProps> = ({
  imageUrl,
  text,
  className = '',
  onCreateAnother,
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `qr-code-${text || 'download'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button 
          onClick={handleDownload}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        
        {onCreateAnother && (
          <Button 
            variant="outline" 
            onClick={onCreateAnother}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Create Another
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRCodePreview;
