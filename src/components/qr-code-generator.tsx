'use client';

import React, { useState, useRef, useEffect, useTransition, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateQrCode } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Phone, 
  Globe, 
  Type, 
  Contact, 
  Wifi as WifiIcon, 
  MapPin, 
  MessageSquare, 
  FileText, 
  Image as ImageIcon, 
  Play, 
  Music,
  X,
  Menu,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileUpload } from './ui/file-upload';
import QRCodePreview from './qr-code-preview';
import { QRState } from '@/types';

const isFile = (value: unknown): value is File => {
  return value instanceof File || 
         (typeof value === 'object' && 
          value !== null && 
          'name' in value && 
          'size' in value && 
          'type' in value);
};

const initialState: QRState = {
  message: '',
  qrImageUrl: '',
  text: '',
  frame: '',
  shape: '',
  errors: {},
};

const QRForm = ({ 
  type, 
  children, 
  fileUrl = '', 
  onFileChange = () => {}
}: { 
  type: string, 
  children?: React.ReactNode,
  fileUrl?: string,
  onFileChange?: (url?: string) => void
}) => {
  const [color, setColor] = useState('#000000');

  const renderFileUpload = () => {
    if (['image', 'video', 'audio', 'pdf'].includes(type)) {
      return (
        <div className="mt-4">
          <FileUpload
            value={fileUrl}
            onChange={(url) => onFileChange?.(url)}
            fileType={type as 'image' | 'video' | 'audio' | 'pdf'}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <input type="hidden" name="type" value={type} />
      {children}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="color-picker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="p-1 h-10 w-10 cursor-pointer"
            />
            <Input
              id="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      </div>
      {renderFileUpload()}
    </div>
  )
}

const tabs = [
  { id: 'website', label: 'Website', icon: <Globe className="w-4 h-4 mr-2" /> },
  { id: 'text', label: 'Text', icon: <Type className="w-4 h-4 mr-2" /> },
  { id: 'vcard', label: 'vCard', icon: <Contact className="w-4 h-4 mr-2" /> },
  { id: 'wifi', label: 'WiFi', icon: <WifiIcon className="w-4 h-4 mr-2" /> },
  { id: 'location', label: 'Location', icon: <MapPin className="w-4 h-4 mr-2" /> },
  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4 mr-2" /> },
  { id: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4 mr-2" /> },
  { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4 mr-2" /> },
  { id: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4 mr-2" /> },
  { id: 'video', label: 'Video', icon: <Play className="w-4 h-4 mr-2" /> },
  { id: 'music', label: 'Music', icon: <Music className="w-4 h-4 mr-2" /> },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Generating...' : 'Generate QR Code'}
    </Button>
  );
}

export function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState("website");
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  type FormValue = string | File | undefined;
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [_, startTransition] = useTransition();
  
  const [state, formAction] = useActionState<QRState, FormData>(
    generateQrCode,
    initialState
  );
  const handleFormAction = (formData: FormData) => {
    return startTransition(async () => {
      formData.append('type', activeTab);

      if (fileUrl) {
        formData.append('url', fileUrl);

        if (activeTab === 'pdf') {
          formData.append('pdfUrl', fileUrl);
        } else if (activeTab === 'image') {
          formData.append('imageUrl', fileUrl);
        } else if (activeTab === 'video') {
          formData.append('videoUrl', fileUrl);
        } else if (activeTab === 'music') {
          formData.append('musicUrl', fileUrl);
        }
      }

      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('filename', selectedFile.name);
      }

      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (!isFile(value)) {
            formData.set(key, String(value));
          }
        }
      });

      return await formAction(formData);
    });
  };

  useEffect(() => {
    if (state.qrImageUrl) {
      setIsFlipped(true);

      setFormValues({});
      setFileUrl(undefined);
      setSelectedFile(null);
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state, filePreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    } as Record<string, FormValue>));
  };

  const getStringValue = (key: string, defaultValue: string = ''): string => {
    const value = formValues[key];
    if (value === undefined || value === null) return defaultValue;
    return String(value);
  };

  const handleFileUpload = async (url?: string) => {
    if (!url) return;
    setFileUrl(url);

    let formValuesUpdate = {};

    if (activeTab === 'pdf') {
      formValuesUpdate = {
        pdfUrl: url,
        text: url
      };
    } else if (activeTab === 'image') {
      formValuesUpdate = {
        imageUrl: url,
        text: url
      };
    } else if (activeTab === 'video') {
      formValuesUpdate = {
        videoUrl: url,
        text: url
      };
    } else if (activeTab === 'music') {
      formValuesUpdate = {
        musicUrl: url,
        text: url
      };
    }

    setFormValues(prev => ({
      ...prev,
      ...(formValuesUpdate as Record<string, string>)
    } as Record<string, FormValue>));

    const formData = new FormData();
    formData.append('type', activeTab);
    formData.append('url', url);

    if (activeTab === 'pdf') {
      formData.append('pdfUrl', url);
    } else if (activeTab === 'image') {
      formData.append('imageUrl', url);
    } else if (activeTab === 'video') {
      formData.append('videoUrl', url);
    } else if (activeTab === 'music') {
      formData.append('musicUrl', url);
    }
    

    if (formValues.color) {
      formData.append('color', formValues.color);
    }
    

    try {
      await formAction(formData);

    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      

      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      

      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setFilePreview(previewUrl);
      } else {
        setFilePreview(null);
      }
      

      const { name } = e.target;
      setFormValues(prev => ({
        ...prev,
        [name]: file.name,
        [`${name}File`]: file
      }));
    }
  };
  

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);


  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
      setSelectedFile(null);
    };
  }, [activeTab]);


  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, []);

  const handleReset = () => {
    setIsFlipped(false);
    setSelectedFile(null);
    setFilePreview(null);

    if (formRef.current) {
      formRef.current.reset();
    }

    const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFormValues({});

    const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
      setSelectedFile(null);
    }
  };


  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="perspective w-full">
          <div className="relative preserve-3d w-full" style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s',
            width: '100%',
            minHeight: '80vh'
          }}>
            
            <div className="card-face card-front w-full p-6">
              <div className="flex flex-col gap-6">
                
                <div className="sm:hidden mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <span>{tabs.find(t => t.id === activeTab)?.label}</span>
                    {isMobileMenuOpen ? (
                      <X className="w-4 h-4 ml-2" />
                    ) : (
                      <Menu className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                  
                  
                  {isMobileMenuOpen && (
                    <div className="mt-2 space-y-1 bg-card border rounded-md p-2">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            handleTabChange(tab.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                            activeTab === tab.id
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground hover:bg-accent/50"
                          )}
                        >
                          {React.cloneElement(tab.icon, {
                            className: cn("w-4 h-4 mr-2", {
                              "text-primary-foreground": activeTab === tab.id,
                              "text-muted-foreground": activeTab !== tab.id
                            })
                          })}
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                
                <div className="hidden sm:block w-full overflow-x-auto pb-2">
                  <div className="flex space-x-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          "flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {React.cloneElement(tab.icon, {
                          className: cn("w-4 h-4 mr-2", {
                            "text-primary-foreground": activeTab === tab.id,
                            "text-muted-foreground": activeTab !== tab.id
                          })
                        })}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                
                <div className="w-full">
                  <form action={handleFormAction} ref={formRef} className="space-y-6">
                    {activeTab === 'website' && (
                      <QRForm 
                        type="website"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="url">Website URL</Label>
                          <Input
                            id="text"
                            name="text"
                            type="url"
                            value={getStringValue('text')}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                            required
                            className="w-full"
                            autoComplete="url"
                          />
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'vcard' && (
                      <QRForm 
                        type="vcard"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input 
                                id="firstName" 
                                name="firstName" 
                                value={getStringValue('firstName')}
                                onChange={handleInputChange}
                                placeholder="John"
                                required 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input 
                                id="lastName" 
                                name="lastName" 
                                value={getStringValue('lastName')}
                                onChange={handleInputChange}
                                placeholder="Doe"
                                required 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input 
                              id="phone" 
                              name="phone" 
                              type="tel" 
                              value={getStringValue('phone')}
                              onChange={handleInputChange}
                              placeholder="+1 234 567 8900"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input 
                              id="email" 
                              name="email" 
                              type="email" 
                              value={getStringValue('email')}
                              onChange={handleInputChange}
                              placeholder="john.doe@example.com"
                            />
                          </div>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'wifi' && (
                      <QRForm 
                        type="wifi"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="ssid">Network Name (SSID)</Label>
                            <Input 
                              id="ssid" 
                              name="ssid" 
                              value={getStringValue('ssid')}
                              onChange={handleInputChange}
                              placeholder="MyWiFiNetwork"
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                              id="password" 
                              name="password" 
                              type="password" 
                              value={getStringValue('password')}
                              onChange={handleInputChange}
                              placeholder="Enter WiFi password"
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="security">Security</Label>
                            <select 
                              id="security" 
                              name="security" 
                              value={getStringValue('security') || 'WPA'}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                            >
                              <option value="WPA">WPA/WPA2</option>
                              <option value="WEP">WEP</option>
                              <option value="nopass">None</option>
                            </select>
                          </div>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'location' && (
                      <QRForm 
                        type="location"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="latitude">Latitude</Label>
                              <Input
                              id="latitude"
                              name="latitude"
                              type="number"
                              step="any"
                              value={getStringValue('latitude')}
                              onChange={handleInputChange}
                              placeholder="40.7128"
                              required
                            />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="longitude">Longitude</Label>
                              <Input
                              id="longitude"
                              name="longitude"
                              type="number"
                              step="any"
                              value={getStringValue('longitude')}
                              onChange={handleInputChange}
                              placeholder="-74.0060"
                              required
                            />
                            </div>
                          </div>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'email' && (
                      <QRForm 
                        type="email"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="emailTo">To</Label>
                            <Input
                              id="emailTo"
                              name="to"
                              type="email"
                              value={getStringValue('to')}
                              onChange={handleInputChange}
                              placeholder="recipient@example.com"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailSubject">Subject</Label>
                            <Input
                              id="emailSubject"
                              name="subject"
                              value={getStringValue('subject')}
                              onChange={handleInputChange}
                              placeholder="Subject"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailBody">Message</Label>
                            <textarea
                              id="emailBody"
                              name="body"
                              value={getStringValue('body')}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full p-2 border rounded"
                            ></textarea>
                          </div>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'sms' && (
                      <QRForm 
                        type="sms"
                        fileUrl={fileUrl}
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              name="phone"
                              type="tel"
                              value={getStringValue('phone')}
                              onChange={handleInputChange}
                              placeholder="+1234567890"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smsMessage">Message</Label>
                            <textarea
                              id="smsMessage"
                              name="sms"
                              value={getStringValue('sms')}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full p-2 border rounded"
                              placeholder="Type your message here..."
                            ></textarea>
                          </div>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'phone' && (
                      <QRForm 
                        type="phone"
                        fileUrl={fileUrl}
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              name="phone"
                              type="tel"
                              value={getStringValue('phone')}
                              onChange={handleInputChange}
                              placeholder="+1234567890"
                              required
                            />
                          </div>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'text' && (
                      <QRForm 
                        type="text"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="text">Text Content</Label>
                          <textarea
                            id="text"
                            name="text"
                            value={getStringValue('text')}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full p-2 border rounded"
                            placeholder="Enter your text here..."
                            required
                            autoComplete="off"
                          ></textarea>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'image' && (
                      <QRForm 
                        type="image"
                        fileUrl={fileUrl}
                        onFileChange={handleFileUpload}
                      >
                        <div className="space-y-2">
                          <Label>Upload Image</Label>
                          <p className="text-sm text-muted-foreground">
                            Upload an image to generate a QR code (PNG, JPG, GIF, WEBP up to 4MB)
                          </p>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'video' && (
                      <QRForm 
                        type="video"
                        fileUrl={fileUrl}
                        onFileChange={handleFileUpload}
                      >
                        <div className="space-y-2">
                          <Label>Upload Video</Label>
                          <p className="text-sm text-muted-foreground">
                            Upload a video to generate a QR code (MP4, WebM, OGG up to 128MB)
                          </p>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'pdf' && (
                      <QRForm 
                        type="pdf"
                        fileUrl={fileUrl}
                        onFileChange={handleFileUpload}
                      />
                    )}

                    {activeTab === 'music' && (
                      <QRForm 
                        type="music"
                        fileUrl={fileUrl}
                        onFileChange={handleFileUpload}
                      >
                        <div className="space-y-2">
                          <Label>Upload Music</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload a music file to generate a QR code (MP3, WAV, OGG, M4A up to 32MB)
                          </p>
                          <FileUpload
                            value={fileUrl}
                            onChange={(url) => setFileUrl(url || '')}
                            fileType="music"
                          />
                        </div>
                      </QRForm>
                    )}

                    <SubmitButton />
                  </form>
                </div>
              </div>
            </div>
            
            
            <div className="card-face card-back absolute inset-0 w-full h-full p-6 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
              {state.qrImageUrl ? (
                <div className="flex flex-col items-center space-y-6 w-full">
                  <QRCodePreview 
                    imageUrl={state.qrImageUrl}
                    text={String(formValues['text'] || formValues['ssid'] || formValues['phone'] || 'QR Code')}
                    className="w-64 h-64"
                    onCreateAnother={handleReset}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating QR Code...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
