"use client";

import { useCallback, useState, useMemo } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Image as ImageIcon, Video, X, Music, FileText } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

type FileType = 'image' | 'video' | 'audio' | 'pdf';

const ALLOWED_FILE_TYPES: Record<FileType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
};

const FILE_TYPE_EXTENSIONS: Record<FileType, string> = {
  image: '.jpg, .jpeg, .png, .gif, .webp, .svg',
  pdf: '.pdf',
  video: '.mp4, .webm, .ogg',
  audio: '.mp3, .wav, .ogg, .m4a'
};

const MAX_FILE_SIZE = {
  image: 4 * 1024 * 1024, // 4MB
  pdf: 4 * 1024 * 1024,   // 4MB
  video: 128 * 1024 * 1024, // 128MB
  audio: 32 * 1024 * 1024  // 32MB
};

type FileUploadProps = {
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  value?: string;
  fileType?: FileType;
  className?: string;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  onError,
  value,
  fileType = 'image',
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("fileUploader" as any, {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res && res[0]?.url) {
        onChange(res[0].url);
        setError(null);
        if (onError) onError('');
      } else {
        const errorMsg = 'Upload completed but no URL was returned';
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error('Upload error:', error);
      const errorMsg = error.message.includes('Failed to fetch') 
        ? 'Upload failed: Network error. Please check your connection.'
        : `Upload failed: ${error.message}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setIsUploading(false);
    },
    onUploadBegin: () => {
      setError(null);
      setIsUploading(true);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Handle file rejections (invalid type, size, etc.)
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === 'file-invalid-type' || rejection.errors[0].code === 'file-type-invalid') {
          const errorMsg = `Invalid file type. Please upload a ${fileType.toUpperCase()} file (${FILE_TYPE_EXTENSIONS[fileType]})`;
          setError(errorMsg);
          if (onError) onError(errorMsg);
        } else if (rejection.errors[0].code === 'file-too-large') {
          const maxSizeMB = MAX_FILE_SIZE[fileType] / (1024 * 1024);
          const errorMsg = `File is too large. Maximum size is ${maxSizeMB}MB`;
          setError(errorMsg);
          if (onError) onError(errorMsg);
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Additional validation (in case the dropzone config is bypassed)
      if (!ALLOWED_FILE_TYPES[fileType].includes(file.type)) {
        const errorMsg = `Invalid file type. Please upload a ${fileType.toUpperCase()} file (${FILE_TYPE_EXTENSIONS[fileType]})`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      if (file.size > MAX_FILE_SIZE[fileType]) {
        const maxSizeMB = MAX_FILE_SIZE[fileType] / (1024 * 1024);
        const errorMsg = `File is too large. Maximum size is ${maxSizeMB}MB`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      try {
        setError(null);
        setIsUploading(true);
        await startUpload(acceptedFiles);
      } catch (err) {
        console.error('Error in handleDrop:', err);
        const errorMsg = 'Failed to upload file. Please try again.';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setIsUploading(false);
      }
    },
    [startUpload, fileType, onError]
  );

  const accept = useMemo(() => {
    const accept: Record<string, string[]> = {};

    if (fileType === 'image') {
      accept['image/jpeg'] = ['.jpg', '.jpeg'];
      accept['image/png'] = ['.png'];
      accept['image/gif'] = ['.gif'];
      accept['image/webp'] = ['.webp'];
      accept['image/svg+xml'] = ['.svg'];
    } else if (fileType === 'pdf') {
      accept['application/pdf'] = ['.pdf'];
    } else if (fileType === 'video') {
      accept['video/mp4'] = ['.mp4'];
      accept['video/webm'] = ['.webm'];
      accept['video/ogg'] = ['.ogv'];
    } else if (fileType === 'audio') {
      accept['audio/mpeg'] = ['.mp3'];
      accept['audio/wav'] = ['.wav'];
      accept['audio/ogg'] = ['.ogg'];
      accept['audio/mp4'] = ['.m4a'];
    }

    return accept;
  }, [fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: accept as any, // Type assertion needed for react-dropzone
    disabled: isUploading,
    multiple: false,
    maxSize: MAX_FILE_SIZE[fileType],
  });

  const fileExtension = value?.split('.').pop()?.toLowerCase();
  const isImage = fileType === 'image' || (fileExtension && [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'
  ].includes(fileExtension));

  const isVideo = fileType === 'video' || (fileExtension && [
    'mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv'
  ].includes(fileExtension));

  const isAudio = fileType === 'audio' || (fileExtension && [
    'mp3', 'wav', 'ogg', 'm4a', 'aac'
  ].includes(fileExtension));

  const isPDF = fileType === 'pdf' || fileExtension === 'pdf';

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
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : error
            ? "border-destructive/50 hover:border-destructive"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        {error && (
          <p className="text-sm text-destructive mb-2">{error}</p>
        )}
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
          {fileType === 'image' && `Supports: ${FILE_TYPE_EXTENSIONS.image} (up to 4MB)`}
          {fileType === 'video' && `Supports: ${FILE_TYPE_EXTENSIONS.video} (up to 128MB)`}
          {fileType === 'audio' && `Supports: ${FILE_TYPE_EXTENSIONS.audio} (up to 32MB)`}
          {fileType === 'pdf' && `Supports: ${FILE_TYPE_EXTENSIONS.pdf} (up to 4MB)`}
        </p>
        {isUploading && (
          <div className="w-full mt-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uploading...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
