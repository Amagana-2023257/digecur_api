import { uploadToFirebaseStorage } from "../middlewares/multer-uploads.js";
import { admin } from "../../configs/firebase.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const db = admin.firestore();
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(doc => {
      const { username, email, bio, profilePicture, followers, following, name, surname, dateOfBirth } = doc.data();
      return {
        id: doc.id,
        username,
        email,
        bio,
        profilePicture,
        name,
        surname,
        dateOfBirth,
        followersCount: followers ? followers.length : 0,
        followingCount: following ? following.length : 0,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Usuarios obtenidos exitosamente",
      users,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return handleErrorResponse(res, 500, "Error al obtener usuarios", error.message);
  }
};

// Obtener un usuario por su ID
export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return handleErrorResponse(res, 404, "Usuario no encontrado");
    }
    return res.status(200).json({
      success: true,
      message: "Usuario encontrado",
      user: userDoc.data(),
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return handleErrorResponse(res, 500, "Error al obtener usuario", error.message);
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  // Campos a actualizar: username, bio, dateOfBirth, name, surname, profilePicture
  const { username, bio, dateOfBirth, name, surname } = req.body;
  let profilePicture;

  if (!username || !req.body.email) {
    return handleErrorResponse(res, 400, "El nombre de usuario y correo son obligatorios");
  }

  try {
    // Si se subió una nueva foto de perfil, se procesa; de lo contrario se conserva la actual
    if (req.file) {
      profilePicture = await uploadToFirebaseStorage(req);
    } else {
      profilePicture = req.body.profilePicture;
    }

    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return handleErrorResponse(res, 404, "Usuario no encontrado");
    }

    // Construir objeto de actualización de forma condicional para evitar undefined
    let updatedUser = {
      username,
      bio: bio || "",
      profilePicture: profilePicture || userDoc.data().profilePicture,
      updatedAt: new Date().toISOString(),
    };

    if (dateOfBirth !== undefined) updatedUser.dateOfBirth = dateOfBirth;
    if (name !== undefined) updatedUser.name = name;
    if (surname !== undefined) updatedUser.surname = surname;

    await userRef.update(updatedUser);

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return handleErrorResponse(res, 500, "Error al actualizar el usuario", error.message);
  }
};

// Desactivar usuario (borrado lógico)
export const deactivateUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return handleErrorResponse(res, 404, "Usuario no encontrado");
    }
    await userRef.update({ status: false, updatedAt: new Date().toISOString() });
    return res.status(200).json({
      success: true,
      message: "Usuario desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error al desactivar el usuario:", error);
    return handleErrorResponse(res, 500, "Error al desactivar el usuario", error.message);
  }
};

// Eliminar usuario (borrado físico)
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return handleErrorResponse(res, 404, "Usuario no encontrado");
    }
    await userRef.delete();
    return res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return handleErrorResponse(res, 500, "Error al eliminar el usuario", error.message);
  }
};
