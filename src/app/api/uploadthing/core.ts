import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Single file uploader that supports multiple file types
  fileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    video: { maxFileSize: "128MB", maxFileCount: 1 },
    audio: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .onUploadComplete(({ file }) => {
      // Return the file URL in the expected format
      return { 
        ok: true, 
        url: file.ufsUrl || file.url, // Fallback to file.url if ufsUrl is not available
        ufsUrl: file.ufsUrl || file.url // Ensure ufsUrl is always set
      };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
