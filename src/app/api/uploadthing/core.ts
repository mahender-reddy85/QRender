import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({ 
    pdf: { maxFileSize: "8MB" }, 
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "128MB" },
    audio: { maxFileSize: "32MB" }
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload finished:", file.ufsUrl);
      return { success: true, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
