import { QrCode } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="QRender home">
      <div className="bg-primary rounded-lg p-2">
        <QrCode className="h-6 w-6 text-primary-foreground" />
      </div>
    </div>
  );
}
