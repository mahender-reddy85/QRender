'use client';

import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { QRCodeDisplay } from './qr-code-display';
import { Slider } from './ui/slider';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AlertCircle, Wand2, Link as LinkIcon, Type, Mail, Phone as PhoneIcon, MessageSquare, MapPin, Wifi, FileText, UserSquare, ArrowLeft, RotateCcw, Play, Music, ImageIcon, Upload } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs } from "@/components/ui/tabs"
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import { QRState } from '@/lib/definitions';
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";


const initialState: QRState = {
  message: '',
  qrImageUrl: '',
  text: '',
  errors: {},
};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Generating...' : <> <Wand2 className="mr-2 h-4 w-4" /> Generate QR Code</>}
    </Button>
  );
}

const QRForm = ({ type, children }: { type: string, children: React.ReactNode}) => {
    const [color, setColor] = useState('#000000');

    return (
        <div className="space-y-6">
            <input type="hidden" name="type" value={type} />
            {children}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="color-picker"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="p-1 h-8 w-8 cursor-pointer"
                        />
                        <Input id="color" name="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-24" />
                    </div>
                </div>
            </div>




        </div>
    )
}


export function QRCodeGenerator({ isUserLoggedIn }: { isUserLoggedIn: boolean }) {
  const [state, setState] = useState<QRState>(initialState);
  const [activeTab, setActiveTab] = useState("website");
  const [isFlipped, setIsFlipped] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (state.qrImageUrl) {
        setIsFlipped(true);
    }
  }, [state.qrImageUrl]);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setState(result);
      } else {
        setState({ ...initialState, errors: result.errors || {}, message: result.message });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setState({ ...initialState, message: 'An unexpected error occurred.' });
    } finally {
      setPending(false);
    }
  };

    const handleUploadComplete = (url: string, type: string = 'website') => {
        // Build a minimal FormData matching the generate API expectations
        const formData = new FormData();
        formData.append('type', type);
        formData.append('text', url);
        // default color (black) - the server expects a color hex string like #000000
        formData.append('color', '#000000');
        handleSubmit(formData);
    };

  const handleReset = () => {
    setIsFlipped(false);
    formRef.current?.reset();
    setState(initialState);
  };


  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="mt-8 flex justify-center">
        <div className="w-full max-w-6xl perspective">
            <div className={cn("relative preserve-3d transition-transform duration-700", isFlipped && "rotate-y-180")}>
                {/* Front of the card - The Form */}
                <div className="card-face card-front">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Tabs */}
                        <div className="lg:w-1/4 w-full">
                            <div className="bg-muted rounded-lg p-2 space-y-1">
                                <div className="grid grid-cols-2 gap-1 lg:grid-cols-1">
                                    <button
                                        onClick={() => handleTabChange("website")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "website"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        Website
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("vcard")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "vcard"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <UserSquare className="w-4 h-4 mr-2" />
                                        vCard
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("text")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "text"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <Type className="w-4 h-4 mr-2" />
                                        Text
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("wifi")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "wifi"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <Wifi className="w-4 h-4 mr-2" />
                                        Wifi
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("pdf")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "pdf"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("location")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "location"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Location
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("email")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "email"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("phone")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "phone"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <PhoneIcon className="w-4 h-4 mr-2" />
                                        Phone
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("sms")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "sms"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        SMS
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("video")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "video"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Video
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("music")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "music"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <Music className="w-4 h-4 mr-2" />
                                        Music
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("image")}
                                        className={cn(
                                            "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all",
                                            activeTab === "image"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                        suppressHydrationWarning
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Image
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Main Card */}
                        <div className="lg:w-3/4 w-full">
                            <Card className="w-full max-w-2xl mx-auto">
                                <CardContent className="p-6">
                                    <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); handleSubmit(formData); }} ref={formRef}>
                                        {activeTab === "website" && (
                                            <QRForm type="website">
                                                <div className="space-y-2">
                                                    <Label htmlFor="text">URL</Label>
                                                    <Input id="text" name="text" placeholder="https://example.com" required />
                                                    {state.errors?.text && <p className="text-sm font-medium text-destructive">{state.errors.text}</p>}
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "text" && (
                                            <QRForm type="text">
                                                <div className="space-y-2">
                                                    <Label htmlFor="text-input">Text</Label>
                                                    <Textarea id="text-input" name="text" placeholder="Enter any text" required />
                                                    {state.errors?.text && <p className="text-sm font-medium text-destructive">{state.errors.text}</p>}
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "vcard" && (
                                            <QRForm type="vcard">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="firstName">First Name</Label>
                                                        <Input id="firstName" name="firstName" placeholder="John" required/>
                                                        {state.errors?.firstName && <p className="text-sm font-medium text-destructive">{state.errors.firstName}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="lastName">Last Name</Label>
                                                        <Input id="lastName" name="lastName" placeholder="Doe" required/>
                                                        {state.errors?.lastName && <p className="text-sm font-medium text-destructive">{state.errors.lastName}</p>}
                                                    </div>
                                                    <div className="space-y-2 sm:col-span-2">
                                                        <Label htmlFor="organization">Organization</Label>
                                                        <Input id="organization" name="organization" placeholder="ACME Inc." />
                                                        {state.errors?.organization && <p className="text-sm font-medium text-destructive">{state.errors.organization}</p>}
                                                    </div>
                                                    <div className="space-y-2 sm:col-span-2">
                                                        <Label htmlFor="title">Title</Label>
                                                        <Input id="title" name="title" placeholder="CEO" />
                                                        {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone-vcard">Phone</Label>
                                                        <Input id="phone-vcard" name="phone" type="tel" placeholder="+1234567890" />
                                                        {state.errors?.phone && <p className="text-sm font-medium text-destructive">{state.errors.phone}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email-vcard">Email</Label>
                                                        <Input id="email-vcard" name="email" type="email" placeholder="john.doe@acme.com" />
                                                        {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
                                                    </div>
                                                    <div className="space-y-2 sm:col-span-2">
                                                        <Label htmlFor="website-vcard">Website</Label>
                                                        <Input id="website-vcard" name="website" placeholder="https://acme.com" />
                                                        {state.errors?.website && <p className="text-sm font-medium text-destructive">{state.errors.website}</p>}
                                                    </div>
                                                    <div className="space-y-2 sm:col-span-2">
                                                        <Label htmlFor="address-vcard">Address</Label>
                                                        <Textarea id="address-vcard" name="address" placeholder="123 Main St, Anytown, USA" />
                                                        {state.errors?.address && <p className="text-sm font-medium text-destructive">{state.errors.address}</p>}
                                                    </div>
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "wifi" && (
                                            <QRForm type="wifi">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="ssid">Network Name (SSID)</Label>
                                                        <Input id="ssid" name="ssid" placeholder="MyWifiNetwork" required />
                                                        {state.errors?.ssid && <p className="text-sm font-medium text-destructive">{state.errors.ssid}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password-wifi">Password</Label>
                                                        <Input id="password-wifi" name="password" type="password" placeholder="Your network password" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="encryption">Encryption</Label>
                                                        <Select name="encryption" defaultValue="WPA">
                                                            <SelectTrigger id="encryption">
                                                                <SelectValue placeholder="Select encryption" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                                                                <SelectItem value="WEP">WEP</SelectItem>
                                                                <SelectItem value="nopass">None</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {state.errors?.encryption && <p className="text-sm font-medium text-destructive">{state.errors.encryption}</p>}
                                                    </div>
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "pdf" && (
                                            <QRForm type="pdf">
                                                <div className="space-y-2">
                                                    <Label htmlFor="pdfFile">Upload PDF File</Label>
                                                    <UploadButton<OurFileRouter, "pdfUploader">
                                                        endpoint="pdfUploader"
                                                        onClientUploadComplete={(res) => {
                                                            if (res && res[0]) {
                                                                // generate QR code pointing to the uploaded PDF URL
                                                                handleUploadComplete(res[0].ufsUrl, 'pdf');
                                                            }
                                                        }}
                                                        onUploadError={(error) => {
                                                            alert(`Upload failed: ${error.message}`);
                                                        }}
                                                    />
                                                    {state.errors?.pdfFile && <p className="text-sm font-medium text-destructive">{state.errors.pdfFile}</p>}
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "location" && (
                                            <QRForm type="location">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="latitude">Latitude</Label>
                                                        <Input id="latitude" name="latitude" placeholder="e.g., 40.7128" required />
                                                        {state.errors?.latitude && <p className="text-sm font-medium text-destructive">{state.errors.latitude}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="longitude">Longitude</Label>
                                                        <Input id="longitude" name="longitude" placeholder="e.g., -74.0060" required />
                                                        {state.errors?.longitude && <p className="text-sm font-medium text-destructive">{state.errors.longitude}</p>}
                                                    </div>
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "email" && (
                                            <QRForm type="email">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email-main">Email</Label>
                                                        <Input id="email-main" name="email" type="email" placeholder="recipient@example.com" required />
                                                        {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="subject">Subject</Label>
                                                        <Input id="subject" name="subject" placeholder="Email Subject" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="body">Body</Label>
                                                        <Textarea id="body" name="body" placeholder="Email body..." />
                                                    </div>
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "phone" && (
                                            <QRForm type="phone">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone-main">Phone Number</Label>
                                                    <Input id="phone-main" name="phone" type="tel" placeholder="+1234567890" required />
                                                    {state.errors?.phone && <p className="text-sm font-medium text-destructive">{state.errors.phone}</p>}
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "sms" && (
                                            <QRForm type="sms">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone-sms">Phone Number</Label>
                                                        <Input id="phone-sms" name="phone" type="tel" placeholder="+1234567890" required />
                                                        {state.errors?.phone && <p className="text-sm font-medium text-destructive">{state.errors.phone}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="sms">Message</Label>
                                                        <Textarea id="sms" name="sms" placeholder="Your SMS message" />
                                                        {state.errors?.sms && <p className="text-sm font-medium text-destructive">{state.errors.sms}</p>}
                                                    </div>
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "video" && (
                                            <QRForm type="video">
                                                <div className="space-y-2">
                                                    <Label htmlFor="videoFile">Upload Video File</Label>
                                                    <UploadButton<OurFileRouter, "videoUploader">
                                                        endpoint="videoUploader"
                                                        onClientUploadComplete={(res) => {
                                                            if (res && res[0]) {
                                                                // use website type for uploaded media URLs
                                                                handleUploadComplete(res[0].ufsUrl, 'website');
                                                            }
                                                        }}
                                                        onUploadError={(error) => {
                                                            alert(`Upload failed: ${error.message}`);
                                                        }}
                                                    />
                                                    {state.errors?.videoFile && <p className="text-sm font-medium text-destructive">{state.errors.videoFile}</p>}
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "music" && (
                                            <QRForm type="music">
                                                <div className="space-y-2">
                                                    <Label htmlFor="musicFile">Upload Music File</Label>
                                                    <UploadButton<OurFileRouter, "musicUploader">
                                                        endpoint="musicUploader"
                                                        onClientUploadComplete={(res) => {
                                                            if (res && res[0]) {
                                                                handleUploadComplete(res[0].ufsUrl, 'website');
                                                            }
                                                        }}
                                                        onUploadError={(error) => {
                                                            alert(`Upload failed: ${error.message}`);
                                                        }}
                                                    />
                                                    {state.errors?.musicFile && <p className="text-sm font-medium text-destructive">{state.errors.musicFile}</p>}
                                                </div>
                                            </QRForm>
                                        )}
                                        {activeTab === "image" && (
                                            <QRForm type="image">
                                                <div className="space-y-2">
                                                    <Label htmlFor="imageFile">Upload Image File</Label>
                                                    <UploadButton<OurFileRouter, "imageUploader">
                                                        endpoint="imageUploader"
                                                        onClientUploadComplete={(res) => {
                                                            if (res && res[0]) {
                                                                handleUploadComplete(res[0].ufsUrl, 'website');
                                                            }
                                                        }}
                                                        onUploadError={(error) => {
                                                            alert(`Upload failed: ${error.message}`);
                                                        }}
                                                    />
                                                    {state.errors?.imageFile && <p className="text-sm font-medium text-destructive">{state.errors.imageFile}</p>}
                                                </div>
                                            </QRForm>
                                        )}

                                        <div className="mt-6 space-y-4">
                                            {!isUserLoggedIn && (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        <Link href="/login" className="font-semibold underline text-primary">Log in</Link> to save your QR codes to your history.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            <SubmitButton pending={pending} />
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Back of the card - The QR Code */}
                <div className="card-face card-back">
                    <div className="w-full h-full">
                       {state.qrImageUrl ? (
                            <div className="flex flex-col h-full">
                <QRCodeDisplay imageUrl={state.qrImageUrl} text={state.text || 'qrcode'}/>
                                <div className="p-6 pt-0">
                                    <Button onClick={handleReset} variant="outline" className="w-full">
                                        <RotateCcw className="mr-2 h-4 w-4"/>
                                        Create Another
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // This is shown briefly during flip-back
                            <Card className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">Generating...</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
