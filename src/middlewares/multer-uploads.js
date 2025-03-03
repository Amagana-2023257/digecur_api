// src/middlewares/multer-uploads.js

import multer from 'multer';
import { cloudinary } from '../../configs/cloudinary.js';
import { Readable } from 'stream';

// Tipos de archivo permitidos y límite de tamaño (10MB)
const MIMETYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_SIZE = 10000000;

// Configuración de Multer para validar y almacenar el archivo en memoria
const createMulterConfig = () => {
  return multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        console.log(`Tipo de archivo no permitido: ${file.mimetype}`);
        cb(new Error(`Solo se aceptan archivos de tipo: ${MIMETYPES.join(", ")}`));
      }
    },
    limits: {
      fileSize: MAX_SIZE,
    },
  });
};

// 1. Middleware para foto de perfil de usuario (campo "profilePicture")
export const uploadProfilePicture = createMulterConfig().single("profilePicture");

// 2. Middleware para foto de comunidad (campo "communityPicture")
export const uploadCommunityPicture = createMulterConfig().single("communityPicture");

// Función para convertir el buffer a un stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

/**
 * Sube la imagen a Cloudinary de manera asíncrona.
 * @param {Object} req - El objeto Request de Express.
 * @param {String} folder - Carpeta de destino en Cloudinary (ej: 'profile-pictures', 'communities').
 * @returns {Promise<String>} URL segura de la imagen en Cloudinary.
 */
export const uploadToCloudinary = async (req, folder = 'profile-pictures') => {
  if (!req.file) {
    throw new Error('No file uploaded');
  }

  return new Promise((resolve, reject) => {
    const uploadResult = cloudinary.uploader.upload_stream(
      {
        public_id: `${folder}/${req.file.originalname.split('.')[0]}-${Date.now()}`,
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          reject(new Error('Failed to upload image'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convertir el archivo en un stream y enviarlo a Cloudinary
    bufferToStream(req.file.buffer).pipe(uploadResult);
  });
};
