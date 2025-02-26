import jwt from "jsonwebtoken";
import { admin } from "../../configs/firebase.js";

const handleErrorResponse = (res, statusCode, message, error = '') => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export const validateJWT = async (req, res, next) => {
  try {
    let token = req.body.token || req.query.token || req.headers["authorization"];

    if (!token) {
      return handleErrorResponse(res, 401, "No se proporcionó un token en la petición");
    }

    token = token.replace(/^Bearer\s+/, "");
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return handleErrorResponse(res, 400, "Usuario no existe en la DB");
    }

    const user = userDoc.data();

    if (!user.status) {
      return handleErrorResponse(res, 400, "Usuario fue desactivado previamente");
    }

    req.usuario = { ...user, uid }; // Aseguramos incluir uid
    next();

  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 500, "Error al validar el token", err.message);
  }
};
