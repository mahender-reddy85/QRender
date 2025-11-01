export type QRCodeData = {
  id: string;
  userId: string;
  type: string;
  text: string;
  color: string;
  size: number;
  frame?: string;
  logoUrl?: string;
  shape?: string;
  createdAt: Date;
};

export type QRState = {
  message?: string;
  qrImageUrl?: string;
  text?: string;
  frame?: string;
  shape?: string;
  errors?: {
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
    website?: string[];
    address?: string[];
    ssid?: string[];
    password?: string[];
    encryption?: string[];
    pdfFile?: string[];
    latitude?: string[];
    longitude?: string[];
    videoUrl?: string[];
    musicUrl?: string[];
    videoFile?: string[];
    musicFile?: string[];
    imageUrl?: string[];
    imageFile?: string[];
    logoUrl?: string[];
    frame?: string[];
    shape?: string[];
  };
};

export type User = {
  id: string;
  email: string;
  password: string;
};
