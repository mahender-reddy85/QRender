'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { QRCodeData } from './definitions';

// --- QR Code Actions ---

const BaseQRFormSchema = z.object({
  type: z.string(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format.').default('#000000'),
  size: z.coerce.number().min(50).max(1000).default(250),
  logoUrl: z.string().url('Invalid logo URL.').optional().or(z.literal('')),
});

const WebsiteSchema = BaseQRFormSchema.extend({
  text: z.string().url('Please enter a valid URL.'),
});
const TextSchema = BaseQRFormSchema.extend({
  text: z.string().min(1, 'Text cannot be empty.'),
});
const EmailSchema = BaseQRFormSchema.extend({
  to: z.string().email(),
  subject: z.string().optional(),
  body: z.string().optional(),
  email: z.string().email().optional(), // Add missing email field
});
const PhoneSchema = BaseQRFormSchema.extend({
  phone: z.string().min(1, 'Phone number cannot be empty.'),
});
const SMSSchema = BaseQRFormSchema.extend({
  phone: z.string().min(1, 'Phone number cannot be empty.'),
  message: z.string().optional(),
  sms: z.string().optional(), // Add missing sms field
});
const VCardSchema = BaseQRFormSchema.extend({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email for vCard.').optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  address: z.string().optional(),
});
const WifiSchema = BaseQRFormSchema.extend({
  ssid: z.string().min(1, 'Network name is required.'),
  password: z.string().optional(),
  security: z.enum(['WPA', 'WEP', 'nopass']),
  encryption: z.string().optional(),
});
const PDFSchema = BaseQRFormSchema.extend({
  pdfFile: z.any().refine((file) => file && file.size > 0, {
    message: "PDF file is required.",
  }),
});
const LocationSchema = BaseQRFormSchema.extend({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});
const VideoSchema = BaseQRFormSchema.extend({
  videoUrl: z.string().url('Please enter a valid video URL.').optional().or(z.literal('')),
  videoFile: z.any().optional(),
}).refine((data) => data.videoUrl || data.videoFile, {
  message: "Either video URL or video file is required.",
  path: ["videoUrl"],
});

const MusicSchema = BaseQRFormSchema.extend({
  musicUrl: z.string().url('Please enter a valid music URL.').optional().or(z.literal('')),
  musicFile: z.any().optional(),
}).refine((data) => data.musicUrl || data.musicFile, {
  message: "Either music URL or music file is required.",
  path: ["musicUrl"],
});

const ImageSchema = BaseQRFormSchema.extend({
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  imageFile: z.any().optional(),
}).refine((data) => data.imageUrl || data.imageFile, {
  message: "Either image URL or image file is required.",
  path: ["imageUrl"],
});

import { QRState } from './definitions';

export async function generateQrCode(_prevState: QRState, formData: FormData): Promise<QRState> {
  try {
    const data = Object.fromEntries(formData.entries());
    const type = data.type as string;

    let validatedFields;
    let qrContent = '';
    let displayText = '';

    switch (type) {
      case 'website':
        validatedFields = WebsiteSchema.safeParse(data);
        if (validatedFields.success) {
          qrContent = validatedFields.data.text;
          displayText = qrContent;
        }
        break;
      case 'text':
        validatedFields = TextSchema.safeParse(data);
        if (validatedFields.success) {
          qrContent = validatedFields.data.text;
          displayText = qrContent;
        }
        break;
      case 'email':
        validatedFields = EmailSchema.safeParse(data);
        if (validatedFields.success) {
          const { email, subject, body } = validatedFields.data;
          const params = new URLSearchParams();
          if (subject) params.set('subject', subject);
          if (body) params.set('body', body);
          qrContent = `mailto:${email}?${params.toString()}`;
          displayText = email;
        }
        break;
      case 'phone':
        validatedFields = PhoneSchema.safeParse(data);
        if (validatedFields.success) {
          qrContent = `tel:${validatedFields.data.phone}`;
          displayText = validatedFields.data.phone;
        }
        break;
      case 'sms':
        validatedFields = SMSSchema.safeParse(data);
        if (validatedFields.success) {
          const { phone, sms } = validatedFields.data;
          qrContent = `smsto:${phone}:${sms || ''}`;
          displayText = phone;
        }
        break;
      case 'vcard':
        validatedFields = VCardSchema.safeParse(data);
        if (validatedFields.success) {
          const v = validatedFields.data;
          qrContent = `BEGIN:VCARD\nVERSION:3.0\nN:${v.lastName};${v.firstName}\nFN:${v.firstName} ${v.lastName}\n`;
          if(v.organization) qrContent += `ORG:${v.organization}\n`;
          if(v.title) qrContent += `TITLE:${v.title}\n`;
          if(v.phone) qrContent += `TEL;TYPE=WORK,VOICE:${v.phone}\n`;
          if(v.email) qrContent += `EMAIL:${v.email}\n`;
          if(v.website) qrContent += `URL:${v.website}\n`;
          if(v.address) qrContent += `ADR;TYPE=WORK:;;${v.address}\n`;
          qrContent += `END:VCARD`;
          displayText = `${v.firstName} ${v.lastName}`;
        }
        break;
      case 'wifi':
        validatedFields = WifiSchema.safeParse(data);
        if (validatedFields.success) {
          const w = validatedFields.data;
          // Use security as encryption if encryption is not provided
          const encryption = w.encryption || w.security || 'WPA';
          qrContent = `WIFI:T:${encryption};S:${w.ssid};P:${w.password || ''};;`;
          displayText = w.ssid;
        }
        break;
      case 'pdf':
        validatedFields = PDFSchema.safeParse(data);
        if (validatedFields.success) {
          qrContent = 'PDF File';
          displayText = 'PDF Document';
        }
        break;
      case 'location':
        validatedFields = LocationSchema.safeParse(data);
        if (validatedFields.success) {
          const l = validatedFields.data;
          qrContent = `geo:${l.latitude},${l.longitude}`;
          displayText = `Location (${l.latitude}, ${l.longitude})`;
        }
        break;
      case 'video':
        validatedFields = VideoSchema.safeParse(data);
        if (validatedFields.success) {
          qrContent = validatedFields.data.videoUrl || 'Video File';
          displayText = 'Video';
        }
        break;
      case 'music':
        validatedFields = MusicSchema.safeParse(data);
        if (validatedFields.success) {
          qrContent = validatedFields.data.musicUrl || 'Music File';
          displayText = 'Music';
        }
        break;
      case 'image':
        validatedFields = ImageSchema.safeParse(data);
        if (validatedFields.success) {
          qrContent = validatedFields.data.imageUrl || 'Image File';
          displayText = 'Image';
        }
        break;
      default:
        return { message: "Invalid QR code type." };
    }

    if (!validatedFields || !validatedFields.success) {
      return {
        errors: validatedFields?.error.flatten().fieldErrors,
      };
    }

    const { color, size, logoUrl } = validatedFields.data;
    const colorHex = color.substring(1); // Remove '#'

    // Build QR API URL with customizations
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrContent)}&size=${size}x${size}&color=${colorHex}&bgcolor=F0F0F0${logoUrl ? `&logo=${encodeURIComponent(logoUrl)}` : ''}`;

    return { qrImageUrl: qrApiUrl, text: displayText, message: 'QR Code generated!' };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return { message: 'An unexpected error occurred while generating the QR code.' };
  }
}


