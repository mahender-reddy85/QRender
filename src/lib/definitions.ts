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
