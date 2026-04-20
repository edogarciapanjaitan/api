"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = (buffer, folder = "products") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
            if (error || !result) {
                console.error("Cloudinary Upload Error:", error);
                return reject(error || new Error("Failed to upload image."));
            }
            resolve(result);
        });
        streamifier_1.default.createReadStream(buffer).pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
exports.default = cloudinary_1.v2;
