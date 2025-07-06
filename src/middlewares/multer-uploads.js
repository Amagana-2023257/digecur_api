// src/middlewares/multer-uploads.js

import multer from 'multer';
import { cloudinary } from '../../configs/cloudinary.js';
import { Readable } from 'stream';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import path from 'path';

// --- 1) Configuración básica ---
const ALLOWED_MIMES = ['image/png', 'image/jpg', 'image/jpeg'];
const ALLOWED_EXTS  = ['.png', '.jpg', '.jpeg'];
const MAX_SIZE      = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.includes(file.mimetype) || !ALLOWED_EXTS.includes(ext)) {
    return cb(new Error('Solo se aceptan imágenes PNG/JPG de hasta 10 MB'));
  }
  cb(null, true);
};

// Middleware para perfil
export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE }
}).single('profilePicture');

// Middleware para comunidad
export const uploadCommunityPicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE }
}).single('communityPicture');

// --- 2) Helper para streaming a Cloudinary ---
const bufferToStream = buffer => {
  const s = new Readable();
  s.push(buffer);
  s.push(null);
  return s;
};

// --- 3) Upload simplificado y seguro ---
export const uploadToCloudinary = async (req, folder = 'profile-pictures') => {
  const file = req.file;
  if (!file?.buffer) {
    throw new Error('No se subió ningún archivo');
  }
  const buffer = file.buffer;
  const originalName = file.originalname;

  // 3.1 Verificar magic bytes
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !ALLOWED_MIMES.includes(type.mime)) {
    throw new Error('El archivo no es una imagen válida');
  }

  // 3.2 Verificar metadata con sharp
  try {
    await sharp(buffer).metadata();
  } catch {
    throw new Error('No se pudo procesar como imagen');
  }

  // 3.3 Redimensionar/comprimir
  const meta  = await sharp(buffer).metadata();
  const width = Math.min(1500, meta.width);
  const processed = (type.mime === 'image/jpeg'
    ? await sharp(buffer).resize(width).jpeg({ quality: 75 }).toBuffer()
    : await sharp(buffer).resize(width).png().toBuffer()
  );

  // 3.4 Subir a Cloudinary y resolver con callback
  return new Promise((resolve, reject) => {
    const publicId = `${folder}/${path.parse(originalName).name}-${Date.now()}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image' },
      (err, result) => {
        if (err) {
          console.error('Error al subir a Cloudinary:', err);
          return reject(new Error('Error al subir imagen'));
        }
        resolve(result.secure_url);
      }
    );
    bufferToStream(processed).pipe(uploadStream);
  });
};
