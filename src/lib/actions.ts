'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createSession,
  deleteSession,
  findUserByEmail,
  createUser as createDbUser,
  getSessionUserId,
} from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { QRCodeData } from './definitions';
import fs from 'fs';
import path from 'path';

// --- Authentication Actions ---

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthState = {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    server?: string;
  };
};

export async function login(state: AuthState | null, formData: FormData): Promise<AuthState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to log in.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await findUserByEmail(email);
    // In a real app, you would use bcrypt.compare(password, user.password)
    if (!user || user.password !== password) {
      return { message: 'Invalid credentials.' };
    }
    await createSession(user.id);
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'An unknown error occurred.' };
  }
  redirect('/');
}

export async function register(state: AuthState | null, formData: FormData): Promise<AuthState> {
    const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields. Failed to register.',
        };
    }

    const { email, password } = validatedFields.data;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return { message: 'A user with this email already exists.' };
        }
        const user = await createDbUser(email, password);
        await createSession(user.id);
    } catch (error) {
        if (error instanceof Error) {
            return { message: error.message };
        }
        return { message: 'An unknown error occurred.' };
    }
    redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}


// --- QR Code Actions ---

const BaseQRFormSchema = z.object({
    type: z.string(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format.'),
});

const WebsiteSchema = BaseQRFormSchema.extend({
    text: z.string().url('Please enter a valid URL.'),
});
const TextSchema = BaseQRFormSchema.extend({
    text: z.string().min(1, 'Text cannot be empty.'),
});
const EmailSchema = BaseQRFormSchema.extend({
    email: z.string().email(),
    subject: z.string().optional(),
    body: z.string().optional(),
});
const PhoneSchema = BaseQRFormSchema.extend({
    phone: z.string().min(1, 'Phone number cannot be empty.'),
});
const SMSSchema = BaseQRFormSchema.extend({
    phone: z.string().min(1, 'Phone number cannot be empty.'),
    sms: z.string().optional(),
});
const VCardSchema = BaseQRFormSchema.extend({
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    organization: z.string().optional(),
    title: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email for vCard.').optional(),
    website: z.string().url('Invalid URL for vCard.').optional(),
    address: z.string().optional(),
});
const WifiSchema = BaseQRFormSchema.extend({
    ssid: z.string().min(1, 'Network name is required.'),
    password: z.string().optional(),
    encryption: z.enum(['WPA', 'WEP', 'nopass']),
});
const PDFSchema = BaseQRFormSchema.extend({
    pdfFile: z.instanceof(File).refine((file) => file.size > 0, 'PDF file is required.'),
});
const LocationSchema = BaseQRFormSchema.extend({
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
});
const VideoSchema = BaseQRFormSchema.extend({
    videoFile: z.instanceof(File).refine((file) => file.size > 0, 'Video file is required.'),
});

const MusicSchema = BaseQRFormSchema.extend({
    musicFile: z.instanceof(File).refine((file) => file.size > 0, 'Music file is required.'),
});

const ImageSchema = BaseQRFormSchema.extend({
    imageFile: z.instanceof(File).refine((file) => file.size > 0, 'Image file is required.'),
});



export async function getQrHistory(): Promise<QRCodeData[]> {
    const userId = await getSessionUserId();
    if (!userId) return [];
    const qrCodes = await prisma.qRCode.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    return qrCodes.map(qr => ({
        id: qr.id,
        userId: qr.userId,
        type: qr.type,
        text: qr.text,
        color: qr.color,
        size: qr.size,
        frame: qr.frame || undefined,
        logoUrl: qr.logoUrl || undefined,
        shape: qr.shape || undefined,
        createdAt: qr.createdAt,
    }));
}

export async function updateQrCodeTitle(id: string, newTitle: string) {
    const userId = await getSessionUserId();
    if (!userId) throw new Error('Unauthorized');

    await prisma.qRCode.updateMany({
        where: { id, userId },
        data: { text: newTitle },
    });
    revalidatePath('/dashboard');
}

export async function deleteQrCode(id: string) {
    const userId = await getSessionUserId();
    if (!userId) throw new Error('Unauthorized');

    await prisma.qRCode.deleteMany({
        where: { id, userId },
    });
    revalidatePath('/dashboard');
}
