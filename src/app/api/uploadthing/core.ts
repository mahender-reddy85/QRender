import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "8MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
  imageUploader: f({ image: { maxFileSize: "8MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
  videoUploader: f({ video: { maxFileSize: "128MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
  musicUploader: f({ audio: { maxFileSize: "64MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
