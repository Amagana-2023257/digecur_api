import { admin } from '../../configs/firebase.js';

const formatError = (error) => {
  return typeof error === 'object'
    ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    : error;
};

export const emailExists = async (email) => {
  try {
    // Intenta obtener el usuario por email
    await admin.auth().getUserByEmail(email);
    return true; // Si se encuentra, el email ya existe
  } catch (error) {
    // Si el error indica que no se encontró al usuario, retorna false
    if (error.code === 'auth/user-not-found') {
      return false;
    }
    // Para cualquier otro error, lo relanza formateado
    throw new Error(formatError(error));
  }
};

export const usernameExists = async (username) => {
    const db = admin.firestore();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();
    return !snapshot.empty; // Si snapshot no está vacío, significa que el username ya existe
  };



export const blockRole = (value) => {
    if (value) {
      throw new Error("No puedes setear el rol. El rol será asignado automáticamente como 'CLIENT', contacta con un Administrador.");
    }
    return true;
};  


export const userExists = async (uid = " ") => {
    const existe = await User.findById(uid)
    if(!existe){
        throw new Error("No existe el usuario con el ID proporcionado")
    }
}

export const userExistsToken = async (value, { req }) => {
    const uidFromToken = req.usuario._id; 
    if (!uidFromToken) {
      throw new Error("ID de usuario no disponible en el token");
    }

    if (value && value !== uidFromToken.toString()) {
      throw new Error("No tiene permisos para actualizar este usuario");
    }

    const user = await User.findById(uidFromToken);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return true;
}

export const blockToken = (value) => {
    if (value) {
      throw new Error("No puedes setear el rol. El rol será asignado automáticamente como 'CLIENT', contacta con un Administrador");
    }
    return true;
}

export const pictureExist = (value, { req }) => {
    if (!req.file) {
        throw new Error('Se requiere un archivo de imagen');
    }
    return true;
}

export const searchProduct = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("El producto no existe.");
    }
    return true;
  }