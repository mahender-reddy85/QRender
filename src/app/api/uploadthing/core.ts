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
    .onUploadComplete(async ({ file }) => {
      try {
        console.log("Uploaded file:", file.ufsUrl);
        return {
          status: "ok",
          url: file.ufsUrl,
        };
      } catch (e) {
        console.error("Callback failed:", e);
        return {
          status: "error",
          error: "callback crashed",
        };
      }
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
