"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStartShift = validateStartShift;
exports.validateEndShift = validateEndShift;
// --- Sanitization helpers ---
function sanitizeNumber(value) {
    if (value === undefined || value === null || value === "")
        return null;
    const num = Number(value);
    if (isNaN(num))
        return null;
    return num;
}
// --- Validation rules ---
const CASH_MIN = 0;
const CASH_MAX = 100000000; // 100 juta
// --- Start Shift Validator ---
function validateStartShift(req, res, next) {
    const errors = [];
    const startingCash = sanitizeNumber(req.body.startingCash);
    if (startingCash === null) {
        errors.push({ field: "startingCash", message: "Uang awal wajib diisi" });
    }
    else if (startingCash < CASH_MIN) {
        errors.push({
            field: "startingCash",
            message: "Uang awal tidak boleh negatif",
        });
    }
    else if (startingCash > CASH_MAX) {
        errors.push({
            field: "startingCash",
            message: `Uang awal maksimal Rp ${CASH_MAX.toLocaleString("id-ID")}`,
        });
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validasi gagal", errors });
        return;
    }
    req.body.startingCash = startingCash;
    next();
}
// --- End Shift Validator ---
function validateEndShift(req, res, next) {
    const errors = [];
    const endingCash = sanitizeNumber(req.body.endingCash);
    if (endingCash === null) {
        errors.push({ field: "endingCash", message: "Uang akhir wajib diisi" });
    }
    else if (endingCash < CASH_MIN) {
        errors.push({
            field: "endingCash",
            message: "Uang akhir tidak boleh negatif",
        });
    }
    else if (endingCash > CASH_MAX) {
        errors.push({
            field: "endingCash",
            message: `Uang akhir maksimal Rp ${CASH_MAX.toLocaleString("id-ID")}`,
        });
    }
    if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validasi gagal", errors });
        return;
    }
    req.body.endingCash = endingCash;
    next();
}
