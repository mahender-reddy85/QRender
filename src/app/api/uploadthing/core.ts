import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .onUploadComplete(async ({ file }) => {
      // This code runs on the server after upload
      console.log("Upload complete for image:", file);
    }),
  
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .onUploadComplete(({ file }) => {
      console.log("Upload complete for PDF:", file);
    }),
    
  videoUploader: f({ video: { maxFileSize: "128MB" } })
    .onUploadComplete(({ file }) => {
      console.log("Upload complete for video:", file);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
