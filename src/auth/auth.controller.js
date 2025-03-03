// src/controllers/auth.controller.js

import { admin } from "../../configs/firebase.js"; 
import { validationResult } from 'express-validator';
import { generateJWT } from "../helpers/generate-jwt.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";
// Se importa la función para subir la imagen a Cloudinary desde el middleware unificado
import { uploadToCloudinary  } from "../middlewares/multer-uploads.js";

// Registrar nuevo usuario
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return handleErrorResponse(res, 400, "Validation error", errors.array());
  }

  try {
    const data = req.body;
    if (!req.file) {
      return handleErrorResponse(res, 400, "La foto está vacía");
    }

    // Subimos la imagen a la carpeta "profile-pictures"
    const profilePicture = await uploadToCloudinary (req, "profile-pictures");

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.username,
    });

    // Guardar info adicional en Firestore
    const db = admin.firestore();
    await db.collection("users").doc(userRecord.uid).set({
      username: data.username,
      email: data.email,
      bio: data.bio || "",
      dateOfBirth: data.dateOfBirth,
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
    console.error("Error en el registro:", err);
    return handleErrorResponse(res, 500, "Error en el registro del usuario", err);
  }
};

// Iniciar sesión del usuario
export const login = async (req, res) => {
  const { email } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const token = await generateJWT(userRecord.uid);

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return handleErrorResponse(res, 404, "Usuario no encontrado");
    }

    const userData = userDoc.data();

    // Asignar un placeholder si no existe foto
    if (!userData.profilePicture) {
      userData.profilePicture = 'https://placehold.co/40x40?text=User';
    }

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      userDetails: {
        token,
        username: userData.username,
        email: userData.email,
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
