"use client";

import type { QRCodeData } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { QRCodeDisplay } from '../qr-code-display';
import { Button } from '../ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteQrCode } from '@/lib/actions';
import { Download, Trash2 } from 'lucide-react';


function constructQrUrl(item: QRCodeData): string {
    const colorHex = item.color.substring(1);
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(item.text)}&size=${item.size}x${item.size}&color=${colorHex}&bgcolor=F0F0F0`;
}


export function HistoryClient({ initialHistory }: { initialHistory: QRCodeData[] }) {
    
    if (initialHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
                <h3 className="text-2xl font-bold tracking-tight">No history yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Generate some QR codes to see them here.
                </p>
            </div>
        )
    }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {initialHistory.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  <span className="block truncate" title={item.text}>
                    {item.text.length > 15 ? `${item.text.slice(0, 15)}...` : item.text}
                  </span>
                </CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                <Image
                  src={constructQrUrl(item)}
                  alt={`QR Code for ${item.text}`}
                  width={150}
                  height={150}
                  className="rounded-md"
                  unoptimized
                />
                <div className="w-full text-sm text-muted-foreground">
                  <p><strong>Type:</strong> {item.type}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        // prevent opening the dialog when clicking the button
                        e.stopPropagation();
                        // download QR image
                        (async () => {
                          try {
                            const response = await fetch(constructQrUrl(item));
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `qrcode-${item.text.slice(0,20).replace(/\s/g, '_')}.png`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();
                          } catch (err) {
                            console.error('Download failed', err);
                          }
                        })();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this QR code?')) {
                          await deleteQrCode(item.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                  <span className="block truncate" title={item.text}>
                    {item.text}
                  </span>
                </DialogTitle>
            </DialogHeader>
            <QRCodeDisplay imageUrl={constructQrUrl(item)} text={item.text} />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
