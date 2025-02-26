import multer from 'multer';
import { Readable } from 'stream';
import { admin } from '../../configs/firebase.js'; // Ajusta la ruta según tu estructura

// ===================
// Configuración de Multer
// ===================
const ALLOWED_MIMETYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  const errorMsg = `Solo se aceptan archivos de tipo: ${ALLOWED_MIMETYPES.join(", ")}`;
  return cb(new Error(errorMsg));
};

const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};

// Middleware para procesar la subida del archivo
export const uploadProfilePicture = multer(multerConfig);

// ===================
// Función para subir archivo a Firebase Storage
// ===================
const bucket = admin.storage().bucket();

export const uploadToFirebaseStorage = async (req) => {
  if (!req.file) {
    throw new Error('No se subió ningún archivo');
  }

  return new Promise((resolve, reject) => {
    const fileName = `profile-pictures/${req.file.originalname.split('.')[0]}-${Date.now()}`;
    const file = bucket.file(fileName);
    const stream = bufferToStream(req.file.buffer);
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      resolve(publicUrl);
    });

    writeStream.on('error', (error) => {
      console.error('Error al subir la imagen a Firebase Storage:', error);
      reject(new Error('Fallo al subir la imagen a Firebase Storage'));
    });
  });
};

const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};
