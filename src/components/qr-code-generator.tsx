'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { QRState } from '@/lib/definitions';
import { generateQrCode } from '@/lib/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Mail, Phone, Globe, Type, Contact, Wifi as WifiIcon, MapPin, MessageSquare, FileText, Play, Music, Upload, Menu, X, Image as ImageIcon } from 'lucide-react';
import { FileUpload } from './ui/file-upload';
import { QRCodeDisplay } from './qr-code-display';

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
    if (type === 'image' || type === 'pdf' || type === 'video') {
      return (
        <div className="mt-4">
          <FileUpload
            endpoint={`${type}Uploader`}
            value={fileUrl}
            onChange={onFileChange}
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
  // @ts-ignore - useFormStatus is not in the React types yet
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
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [_, startTransition] = useTransition();
  
  const [state, formAction] = useActionState<QRState, FormData>(
    generateQrCode,
    initialState
  );
  // Form action that handles the submission with transition
  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
      formData.append('type', activeTab);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Add all form values to formData
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.set(key, value);
        }
      });

      await formAction(formData);
    });
  };
  
  // Update local state when form state changes
  useEffect(() => {
    if (state.qrImageUrl) {
      setIsFlipped(true);
    }
  }, [state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Clean up previous preview if it exists
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
      
      // Create preview based on file type
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setFilePreview(URL.createObjectURL(file));
      } else if (file.type.startsWith('video/')) {
        setFilePreview(URL.createObjectURL(file));
      } else if (file.type.startsWith('audio/')) {
        setFilePreview(URL.createObjectURL(file));
      }
      
      const { name } = e.target;
      setFormValues(prev => ({
        ...prev,
        [name]: file.name
      }));
    }
  };
  
  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Clean up when component unmounts or tab changes
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
      setSelectedFile(null);
    };
  }, [activeTab]);

  // Clean up when component unmounts
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
    // Reset form if it exists
    if (formRef.current) {
      formRef.current.reset();
    }
    // Clear file input if it exists
    const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFormValues({});
    // Clear file input when changing tabs
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
            {/* Front of the card - The Form */}
            <div className="card-face card-front w-full p-6">
              <div className="flex flex-col gap-6">
                {/* Mobile Menu Button */}
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
                  
                  {/* Mobile Menu Dropdown */}
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

                {/* Desktop Tabs */}
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

                {/* Form Content */}
                <div className="bg-card p-6 rounded-lg border w-full">
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
                            value={formValues['text'] || ''}
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
                                value={formValues['firstName'] || ''}
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
                                value={formValues['lastName'] || ''}
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
                              value={formValues['phone'] || ''}
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
                              value={formValues['email'] || ''}
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
                              value={formValues['ssid'] || ''}
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
                              value={formValues['password'] || ''}
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
                              value={formValues['security'] || 'WPA'}
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
                              value={formValues['latitude'] || ''}
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
                              value={formValues['longitude'] || ''}
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
                              value={formValues['to'] || ''}
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
                              value={formValues['subject'] || ''}
                              onChange={handleInputChange}
                              placeholder="Subject"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailBody">Message</Label>
                            <textarea
                              id="emailBody"
                              name="body"
                              value={formValues['body'] || ''}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full p-2 border rounded"
                            ></textarea>
                          </div>
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'phone' && (
                      <QRForm 
                        type="phone"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            name="phone"
                            type="tel"
                            value={formValues['phone'] || ''}
                            onChange={handleInputChange}
                            placeholder="+1234567890"
                            required
                          />
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'sms' && (
                      <QRForm 
                        type="sms"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="smsNumber">Phone Number</Label>
                            <Input
                              id="smsNumber"
                              name="phone"
                              type="tel"
                              value={formValues['phone'] || ''}
                              onChange={handleInputChange}
                              placeholder="+1234567890"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <textarea
                              id="message"
                              name="message"
                              value={formValues['message'] || ''}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full p-2 border rounded"
                            ></textarea>
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
                            value={formValues['text'] || ''}
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

                    {activeTab === 'pdf' && (
                      <QRForm 
                        type="pdf"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="file-upload">Upload PDF</Label>
                            <div className="file-upload-area">
                              <Input
                                id="file-upload"
                                name="file"
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <Upload className="w-8 h-8 text-muted-foreground" />
                                  <p className="text-sm">
                                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF file (max 10MB)
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                          {filePreview && selectedFile?.type === 'application/pdf' && (
                            <div className="preview-container">
                              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-8 w-8 text-red-500" />
                                <a 
                                  href={filePreview} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {selectedFile.name}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'image' && (
                      <QRForm 
                        type="image"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="file-upload">Upload Image</Label>
                            <div className="file-upload-area">
                              <Input
                                id="file-upload"
                                name="file"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                  <p className="text-sm">
                                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, GIF up to 10MB
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                          {filePreview && selectedFile?.type.startsWith('image/') && (
                            <div className="preview-container">
                              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                              <div className="relative w-full max-w-xs mx-auto">
                                <img 
                                  src={filePreview} 
                                  alt="Preview" 
                                  className="rounded-lg border border-border max-h-64 object-contain w-full"
                                />
                                <p className="mt-2 text-xs text-center text-muted-foreground truncate">
                                  {selectedFile.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'video' && (
                      <QRForm 
                        type="video"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="file-upload">Upload Video</Label>
                            <div className="file-upload-area">
                              <Input
                                id="file-upload"
                                name="file"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <Play className="w-8 h-8 text-muted-foreground" />
                                  <p className="text-sm">
                                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    MP4, WebM up to 50MB
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                          {filePreview && selectedFile?.type.startsWith('video/') && (
                            <div className="preview-container">
                              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                              <div className="relative w-full max-w-xs mx-auto">
                                <video 
                                  src={filePreview} 
                                  controls
                                  className="rounded-lg border border-border max-h-64 w-full"
                                />
                                <p className="mt-2 text-xs text-center text-muted-foreground truncate">
                                  {selectedFile.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </QRForm>
                    )}

                    {activeTab === 'music' && (
                      <QRForm 
                        type="music"
                        fileUrl={fileUrl}
                        onFileChange={(url) => setFileUrl(url || '')}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="file-upload">Upload Music</Label>
                            <div className="file-upload-area">
                              <Input
                                id="file-upload"
                                name="file"
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <Music className="w-8 h-8 text-muted-foreground" />
                                  <p className="text-sm">
                                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    MP3, WAV up to 20MB
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                          {filePreview && selectedFile?.type.startsWith('audio/') && (
                            <div className="preview-container">
                              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                              <div className="w-full max-w-xs mx-auto">
                                <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                                  <div className="flex-shrink-0">
                                    <Music className="h-10 w-10 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {selectedFile.name.replace(/\.[^/.]+$/, '')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {selectedFile.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
                                    </p>
                                  </div>
                                </div>
                                <audio 
                                  src={filePreview} 
                                  controls 
                                  className="w-full mt-2"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </QRForm>
                    )}
                    
                    <div className="pt-4">
                      <SubmitButton />
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Back of the card - QR Code */}
          {state.message && !state.qrImageUrl && (
              <div className="card-face card-back w-full h-full">
                <div className="w-full h-full p-6">
                  {state.qrImageUrl && (
                    <QRCodeDisplay 
                      imageUrl={state.qrImageUrl}
                      text={state.text || 'QR Code'}
                      className="w-full max-w-xs mx-auto"
                      onCreateAnother={handleReset}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
