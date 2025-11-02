import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

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

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
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
                    qrContent = `WIFI:T:${w.encryption};S:${w.ssid};P:${w.password || ''};;`;
                    displayText = w.ssid;
                }
                break;
            case 'pdf':
                validatedFields = PDFSchema.safeParse(data);
                if (validatedFields.success) {
                    const file = validatedFields.data.pdfFile;
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileName = `${Date.now()}-${file.name}`;
                    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                    fs.writeFileSync(filePath, buffer);
                    qrContent = `/uploads/${fileName}`;
                    displayText = file.name;
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
                    const file = validatedFields.data.videoFile;
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileName = `${Date.now()}-${file.name}`;
                    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                    fs.writeFileSync(filePath, buffer);
                    qrContent = `/uploads/${fileName}`;
                    displayText = file.name;
                }
                break;
            case 'music':
                validatedFields = MusicSchema.safeParse(data);
                if (validatedFields.success) {
                    const file = validatedFields.data.musicFile;
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileName = `${Date.now()}-${file.name}`;
                    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                    fs.writeFileSync(filePath, buffer);
                    qrContent = `/uploads/${fileName}`;
                    displayText = file.name;
                }
                break;
            case 'image':
                validatedFields = ImageSchema.safeParse(data);
                if (validatedFields.success) {
                    const file = validatedFields.data.imageFile;
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileName = `${Date.now()}-${file.name}`;
                    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                    fs.writeFileSync(filePath, buffer);
                    qrContent = `/uploads/${fileName}`;
                    displayText = file.name;
                }
                break;
            default:
                return NextResponse.json({ message: "Invalid QR code type." }, { status: 400 });
        }

        if (!validatedFields || !validatedFields.success) {
            return NextResponse.json({
                errors: validatedFields?.error.flatten().fieldErrors,
            }, { status: 400 });
        }

        const { color } = validatedFields.data;
        const colorHex = color.substring(1); // Remove '#'

        // Build QR API URL with customizations
        let qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrContent)}&size=250x250&color=${colorHex}&bgcolor=F0F0F0`;

        const userId = await getSessionUserId();
        if (userId) {
            try {
                await prisma.qRCode.create({
                    data: {
                        userId,
                        type,
                        text: displayText,
                        color,
                        size: 250,
                        frame: null,
                        logoUrl: null,
                        shape: null,
                    },
                });
            } catch (dbError) {
                // Log the error but don't fail the QR generation
                console.error('Failed to save QR code to database:', dbError);
            }
        }

        return NextResponse.json({ qrImageUrl: qrApiUrl, text: displayText, message: 'QR Code generated!' });
    } catch (error) {
        console.error('Error generating QR code:', error);
        return NextResponse.json({ message: 'An unexpected error occurred while generating the QR code.' }, { status: 500 });
    }
}
