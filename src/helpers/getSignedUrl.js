import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.STORAGE_BUCKET;

/**
 * Extrae el file path de una URL completa, si es necesario.
 * Por ejemplo, convierte:
 * "https://storage.googleapis.com/mycnb-17624.appspot.com/profile-pictures/mi-foto.jpg"
 * en "profile-pictures/mi-foto.jpg"
 */
const extractFilePath = (url) => {
  const bucketUrlPrefix = `https://storage.googleapis.com/${bucketName}/`;
  if (url.startsWith(bucketUrlPrefix)) {
    return url.substring(bucketUrlPrefix.length);
  }
  return url;
};

/**
 * Genera una URL firmada para el archivo indicado.
 * @param {string} fileName - Nombre (ruta) del archivo en el bucket.
 * @returns {Promise<string>} - URL firmada.
 */
export const getSignedUrl = async (fileName) => {
  // Si se pasa una URL completa, extraer el file path.
  if (fileName.startsWith("http")) {
    fileName = extractFilePath(fileName);
  }

  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutos
  };

  try {
    const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
    return url;
  } catch (err) {
    console.error("Error en getSignedUrl:", err);
    throw err;
  }
};
