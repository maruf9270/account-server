import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with secure URLs
cloudinary.config({
  timeout: 60000,
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export default cloudinary;
