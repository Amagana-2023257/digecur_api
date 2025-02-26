import { admin } from "../../configs/firebase.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";

// Crear un hilo en una comunidad
export const createThread = async (req, res) => {
  try {
    const { communityId, title, content } = req.body;
    // Se asume que el usuario autenticado está en req.usuario
    const authorId = req.usuario.uid;
    const threadData = {
      communityId,
      title,
      content,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
    };

    const db = admin.firestore();
    const threadRef = await db.collection("threads").add(threadData);

    return res.status(201).json({
      success: true,
      message: "Hilo creado exitosamente",
      thread: { id: threadRef.id, ...threadData },
    });
  } catch (error) {
    console.error("Error al crear el hilo:", error);
    return handleErrorResponse(res, 500, "Error al crear el hilo", error.message);
  }
};

// Listar hilos de una comunidad
export const getThreadsByCommunity = async (req, res) => {
  const { communityId } = req.params;
  try {
    const db = admin.firestore();
    const threadsSnapshot = await db.collection("threads").where("communityId", "==", communityId).get();
    const threads = threadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json({
      success: true,
      message: "Hilos obtenidos exitosamente",
      threads,
    });
  } catch (error) {
    console.error("Error al obtener hilos:", error);
    return handleErrorResponse(res, 500, "Error al obtener hilos", error.message);
  }
};

// Obtener un hilo por su ID
export const getThreadById = async (req, res) => {
  const { threadId } = req.params;
  try {
    const db = admin.firestore();
    const threadDoc = await db.collection("threads").doc(threadId).get();
    if (!threadDoc.exists) {
      return handleErrorResponse(res, 404, "Hilo no encontrado");
    }
    return res.status(200).json({
      success: true,
      message: "Hilo encontrado",
      thread: threadDoc.data(),
    });
  } catch (error) {
    console.error("Error al obtener el hilo:", error);
    return handleErrorResponse(res, 500, "Error al obtener el hilo", error.message);
  }
};
