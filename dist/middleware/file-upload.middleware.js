"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FILE_SIZE = exports.ALLOWED_MIME_TYPES = exports.ALLOWED_EXTENSIONS = exports.ALLOWED_DOCUMENT_EXTENSIONS = exports.ALLOWED_IMAGE_EXTENSIONS = void 0;
exports.uploadSingle = uploadSingle;
const path_1 = __importDefault(require("path"));
// KONFIGURASI VALIDASI
/** Ekstensi file gambar yang diizinkan */
exports.ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
/** Ekstensi file dokumen yang diizinkan */
exports.ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".csv", ".xlsx", ".xls"];
/** Semua ekstensi yang diizinkan */
exports.ALLOWED_EXTENSIONS = [
    ...exports.ALLOWED_IMAGE_EXTENSIONS,
    ...exports.ALLOWED_DOCUMENT_EXTENSIONS,
];
/** MIME types yang diizinkan */
exports.ALLOWED_MIME_TYPES = [
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
exports.MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // If the user submits the form without selecting a file, an empty file part is sent.
    // We can safely ignore it by passing `false` to the callback.
    if (!file.originalname || file.originalname.trim() === "") {
        cb(null, false);
        return;
    }
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    if (!exports.ALLOWED_EXTENSIONS.includes(ext)) {
        cb(new Error(`Ekstensi file "${ext}" tidak diizinkan.`));
        return;
    }
    if (!exports.ALLOWED_MIME_TYPES.includes(mimeType)) {
        cb(new Error(`Tipe file "${mimeType}" tidak diizinkan.`));
        return;
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: exports.MAX_FILE_SIZE },
});
function uploadSingle(fieldName) {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err)
                return handleMulterError(err, res);
            next();
        });
    };
}
function handleMulterError(err, res) {
    // custom error logic
    res.status(400).json({ success: false, message: err.message || "Gagal mengupload file." });
}
