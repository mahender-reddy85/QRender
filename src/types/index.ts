export type QRState = {
  message: string;
  qrImageUrl: string;
  text: string;
  frame: string;
  shape: string;
  errors: {
    text?: string[];
    color?: string[];
    size?: string[];
    email?: string[];
    subject?: string[];
    body?: string[];
    phone?: string[];
    sms?: string[];
    firstName?: string[];
    lastName?: string[];
    organization?: string[];
    title?: string[];
    workPhone?: string[];
    homePhone?: string[];
    url?: string[];
    street?: string[];
    city?: string[];
    state?: string[];
    zipCode?: string[];
    country?: string[];
    note?: string[];
    ssid?: string[];
    password?: string[];
    security?: string[];
    hidden?: string[];
    amount?: string[];
    currency?: string[];
    frame?: string[];
    shape?: string[];
  };
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
