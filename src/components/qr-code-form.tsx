'use client';

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileUpload } from './ui/file-upload';
import { Button } from './ui/button';
import { QRFormProps, QRState } from '@/types';

export const QRForm: React.FC<QRFormProps> = ({
  type,
  children,
  fileUrl = '',
  onFileChange = () => {},
}) => {
  const [color, setColor] = useState('#000000');

  return (
    <div className="space-y-6">
      <input type="hidden" name="type" value={type} />
      {children}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="color-picker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="p-1 h-10 w-10 cursor-pointer"
            />
            <Input
              id="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      </div>
      {['image', 'video', 'audio', 'pdf'].includes(type) && (
        <div className="mt-4">
          <FileUpload
            value={fileUrl}
            onChange={(url) => onFileChange(url)}
            fileType={type as 'image' | 'video' | 'audio' | 'pdf'}
          />
        </div>
      )}
    </div>
  );
};

export const SubmitButton: React.FC = () => {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Generating...' : 'Generate QR Code'}
    </Button>
  );
};

export default QRForm;
