"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Image as ImageIcon, Video, X } from "lucide-react";
import { Progress } from "./progress";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  onChange: (url?: string) => void;
  value?: string;
  endpoint: "imageUploader" | "pdfUploader" | "videoUploader";
};

export const FileUpload = ({
  onChange,
  value,
  endpoint,
}: FileUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res && res[0]?.url) {
        onChange(res[0].url);
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress);
    },
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        startUpload(acceptedFiles);
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const fileType = value?.split(".").pop();
  const isImage = fileType?.match(/(jpg|jpeg|png|gif|webp)$/);
  const isPDF = fileType === "pdf";
  const isVideo = fileType?.match(/(mp4|webm|mov|ogg)$/);

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
        {isPDF && (
          <div className="flex flex-col items-center p-4">
            <FileText className="w-10 h-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {value.split("/").pop()}
            </p>
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
        {endpoint === "imageUploader" ? (
          <ImageIcon className="w-10 h-10 text-muted-foreground" />
        ) : endpoint === "pdfUploader" ? (
          <FileText className="w-10 h-10 text-muted-foreground" />
        ) : (
          <Video className="w-10 h-10 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the file here..."
            : `Drag & drop ${
                endpoint === "imageUploader"
                  ? "an image"
                  : endpoint === "pdfUploader"
                  ? "a PDF"
                  : "a video"
              } here, or click to select`}
        </p>
        <p className="text-xs text-muted-foreground">
          {endpoint === "imageUploader"
            ? "Supports JPG, PNG, GIF, WEBP (max 4MB)"
            : endpoint === "pdfUploader"
            ? "PDF (max 16MB)"
            : "Supports MP4, WebM, OGG (max 128MB)"}
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
