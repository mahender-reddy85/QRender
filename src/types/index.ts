export type QRState = {
  message: string;
  qrImageUrl: string;
  text: string;
  frame: string;
  shape: string;
  errors: Record<string, string>;
};

export type FileUploadProps = {
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  value?: string;
  fileType?: 'image' | 'video' | 'audio' | 'pdf';
  className?: string;
};

export type QRCodeDisplayProps = {
  imageUrl: string;
  text: string;
  className?: string;
  onCreateAnother?: () => void;
};

export type QRFormProps = {
  type: string;
  children?: React.ReactNode;
  fileUrl?: string;
  onFileChange?: (url?: string) => void;
};
