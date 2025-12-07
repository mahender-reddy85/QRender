"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, Video, X, Music, FileText } from "lucide-react";
import { Progress } from "./progress";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

type FileType = 'image' | 'video' | 'audio' | 'pdf';

type FileUploadProps = {
  onChange: (url: string) => void;
  value?: string;
  fileType?: FileType;
};

export const FileUpload = ({
  onChange,
  value,
  fileType = 'image'
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

  const acceptMap = {
    image: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    video: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-matroska': ['.mkv']
    },
    audio: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/mp4': ['.m4a'],
      'audio/aac': ['.aac']
    },
    pdf: { 'application/pdf': ['.pdf'] }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        setError(`Invalid file type. Please upload a ${fileType} file.`);
        return;
      }
      handleDrop(acceptedFiles);
    },
    onDropRejected: () => {
      setError(`Please select a valid ${fileType} file.`);
    },
    disabled: isUploading,
    multiple: false,
    accept: acceptMap[fileType] || acceptMap.image,
    noClick: false,
    noKeyboard: true,
    useFsAccessApi: false // Force using the standard file input
  });

  // Force file input to show only allowed file types
  const inputProps = getInputProps();
  const modifiedInputProps = {
    ...inputProps,
    accept: Object.entries(acceptMap[fileType] || acceptMap.image)
      .map(([mimeType, exts]) => exts.map(ext => `${mimeType}${ext}`).join(','))
      .join(',')
  };

  const fileTypeValue = value?.split('.').pop()?.toLowerCase();
  const isImage = fileType === 'image' || fileTypeValue?.match(/(jpg|jpeg|png|gif|webp)$/);
  const isVideo = fileType === 'video' || fileTypeValue?.match(/(mp4|webm|mov|avi|mkv|ogg)$/);
  const isAudio = fileType === 'audio' || fileTypeValue?.match(/(mp3|wav|ogg|m4a|aac)$/);
  const isPDF = fileType === 'pdf' || fileTypeValue === 'pdf';

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
      <input {...modifiedInputProps} />
      <div className="flex flex-col items-center justify-center space-y-2">
        {fileType === 'image' && <ImageIcon className="w-10 h-10 text-muted-foreground" />}
        {fileType === 'video' && <Video className="w-10 h-10 text-muted-foreground" />}
        {fileType === 'audio' && <Music className="w-10 h-10 text-muted-foreground" />}
        {fileType === 'pdf' && <FileText className="w-10 h-10 text-muted-foreground" />}
        <p className="text-sm text-muted-foreground text-center">
          {isDragActive 
            ? `Drop the ${fileType} file here...`
            : `Click to select or drag & drop a ${fileType} file`}
        </p>
        <p className="text-xs text-muted-foreground text-center">
          {fileType === 'image' && 'Supports: JPG, PNG, GIF, WEBP (up to 4MB)'}
          {fileType === 'video' && 'Supports: MP4, WebM, MOV, AVI, MKV (up to 128MB)'}
          {fileType === 'audio' && 'Supports: MP3, WAV, OGG, M4A, AAC (up to 32MB)'}
          {fileType === 'pdf' && 'Supports: PDF files only (up to 4MB)'}
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
