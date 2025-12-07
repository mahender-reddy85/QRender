"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, Video, X, Upload as UploadIcon, FileText } from "lucide-react";
import { Progress } from "./progress";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  onChange: (url: string) => void;
  value?: string;
};

export const FileUpload = ({
  onChange,
  value,
}: FileUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { startUpload } = useUploadThing("fileUploader" as any, {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res && res[0]?.url) {
        onChange(res[0].url);
        setError(null);
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress);
    },
    onUploadError: (error: Error) => {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        try {
          setError(null);
          setIsUploading(true);
          await startUpload(acceptedFiles);
        } catch (err) {
          console.error('Error in handleDrop:', err);
          setError('Failed to upload file. Please try again.');
          setIsUploading(false);
        }
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const fileType = value?.split(".").pop();
  const isImage = fileType?.match(/(jpg|jpeg|png|gif|webp)$/);
  const isVideo = fileType?.match(/(mp4|webm|mov|ogg)$/);
  const isPDF = fileType?.toLowerCase() === 'pdf';

  if (value) {
    return (
      <div className="relative flex items-center justify-center p-4 mt-2 border rounded-md">
        {isImage && (
          <div className="relative w-full h-40">
            <img
              src={value}
              alt="Uploaded content"
              className="object-cover w-full h-full rounded-md"
            />
          </div>
        )}
        {isVideo && (
          <div className="w-full">
            <video
              src={value}
              className="w-full rounded-md"
              controls
            />
          </div>
        )}
        {isPDF && (
          <div className="flex flex-col items-center p-4">
            <FileText className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              {value.split("/").pop()}
            </p>
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              View PDF
            </a>
          </div>
        )}
        <button
          onClick={() => onChange("")}
          className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-muted/50" : "border-muted-foreground/25"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <UploadIcon className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the file here..."
            : "Drag & drop a file here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Supports: Images (JPG, PNG, GIF, WEBP up to 4MB),<br/>
Videos (MP4, WebM, OGG up to 128MB),<br/>
          Audio (MP3, WAV, OGG, M4A up to 32MB)
        </p>
        {isUploading && (
          <div className="w-full max-w-xs mx-auto mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
