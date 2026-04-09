/**
 * File Upload Validation Middleware
 * 
 * Utility siap pakai untuk memvalidasi file upload (gambar/dokumen).
 * Gunakan middleware ini di route yang memerlukan upload file.
 * 
 * Contoh penggunaan di route:
 * 
 *   import { uploadSingle, uploadMultiple } from "../../middleware/file-upload.middleware";
 * 
 *   // Upload gambar produk (1 file)
 *   router.post("/products", authenticate, uploadSingle("image"), controller.create);
 * 
 *   // Upload banyak file (maks 5)
 *   router.post("/documents", authenticate, uploadMultiple("files", 5), controller.upload);
 */

import path from "path";
import fs from "fs";

// ============================
// KONFIGURASI VALIDASI
// ============================

/** Ekstensi file gambar yang diizinkan */
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** Ekstensi file dokumen yang diizinkan */
export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".csv", ".xlsx", ".xls"];

/** Semua ekstensi yang diizinkan */
export const ALLOWED_EXTENSIONS = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_DOCUMENT_EXTENSIONS,
];

/** MIME types yang diizinkan */
export const ALLOWED_MIME_TYPES = [
  // Gambar
  "image/jpeg",
  "image/png",
  "image/webp",
  // Dokumen
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

/** Ukuran file maksimum: 2 MB (dalam bytes) */
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// ==========================================================
// PANDUAN IMPLEMENTASI MIDDLEWARE MULTER DI MASA MENDATANG
// ==========================================================
// Jika nanti butuh upload file, jalankan: npm install multer @types/multer
// Lalu uncomment kode d bawah ini:
/*

import multer, { FileFilterCallback } from "multer";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50);
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error(`Ekstensi file "${ext}" tidak diizinkan.`));
    return;
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    cb(new Error(`Tipe file "${mimeType}" tidak diizinkan.`));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export function uploadSingle(fieldName: string) {
  return (req: any, res: any, next: any): void => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) return handleMulterError(err, res);
      next();
    });
  };
}

function handleMulterError(err: any, res: any): void {
  // custom error logic
  res.status(400).json({ success: false, message: err.message || "Gagal mengupload file." });
}

*/

