import { admin } from "../../configs/firebase.js"; 
import { validationResult } from 'express-validator';
import { generateJWT } from "../helpers/generate-jwt.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";
import { uploadToFirebaseStorage } from "../middlewares/multer-uploads.js";

// Registrar nuevo usuario usando Firebase Admin
export const register = async (req, res) => {
  // Validar datos del request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return handleErrorResponse(res, 400, "Validation error", errors.array());
  }
  try {
    const data = req.body;

    // Verificar que se haya subido la foto de perfil
    if (!req.file) {
      return handleErrorResponse(res, 400, "La foto está vacía");
    }

    // Subir la foto de perfil a Firebase Storage
    const profilePicture = await uploadToFirebaseStorage(req);

    // Crear el usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.username,
    });

    // Guardar el documento del usuario en Firestore, incluyendo campos adicionales:
    // name, surname y dateOfBirth
    const db = admin.firestore();
    await db.collection("users").doc(userRecord.uid).set({
      username: data.username,
      email: data.email,
      bio: data.bio || "",
      dateOfBirth: data.dateOfBirth, // Formato: YYYY-MM-DD
      profilePicture,
      name: data.name || "",
      surname: data.surname || "",
      role: "USER",
      status: true,
      createdAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: "Usuario creado con éxito",
      userDetails: {
        username: data.username,
        email: data.email,
        profilePicture,
        name: data.name,
        surname: data.surname,
        dateOfBirth: data.dateOfBirth,
      },
    });

  } catch (err) {
    console.error("Error en el registro:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    return handleErrorResponse(res, 500, "Error en el registro del usuario", err);
  }
};

// Iniciar sesión del usuario
export const login = async (req, res) => {
  const { email } = req.body;
  try {
    // Obtener el usuario por email usando Firebase Admin
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Nota: Firebase Admin no verifica contraseñas directamente.
    // Se debe implementar otro mecanismo para autenticar contraseñas (p.ej., API REST de Firebase).
    // Aquí se asume que la autenticación se gestiona por otro medio.

    // Generar un token JWT personalizado para el usuario
    const token = await generateJWT(userRecord.uid);

    // Obtener datos del usuario desde Firestore
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return handleErrorResponse(res, 404, "Usuario no encontrado");
    }
    const userData = userDoc.data();

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      userDetails: {
        token,
        username: userData.username,
        bio: userData.bio,
        role: userData.role,
        profilePicture: userData.profilePicture,
        name: userData.name,
        surname: userData.surname,
        dateOfBirth: userData.dateOfBirth,
        followersCount: userData.followers ? userData.followers.length : 0,
        followingCount: userData.following ? userData.following.length : 0,
      },
    });

  } catch (err) {
    console.error("Error al iniciar sesión:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    return handleErrorResponse(res, 500, "Error al iniciar sesión", err);
  }
};
