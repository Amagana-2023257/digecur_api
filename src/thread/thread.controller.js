// src/controllers/thread.controller.js

import { admin } from "../../configs/firebase.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";

/**
 * Crea un hilo en una comunidad.
 * El usuario autenticado se obtiene de req.usuario.uid.
 */
export const createThread = async (req, res) => {
  try {
    const { communityId, title, content } = req.body;
    const authorId = req.usuario.uid;

    const threadData = {
      communityId,
      title,
      content,
      authorId,
      likes: [], // array de likes (puedes usar likeCount si lo prefieres)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

/**
 * Listar hilos de una comunidad, ordenados por fecha de creación (desc).
 * communityId se obtiene de req.params.
 */
export const getThreadsByCommunity = async (req, res) => {
  const { communityId } = req.params;
  try {
    // FALTA: definir db
    const db = admin.firestore();
    
    // Hacer la consulta con .where + .orderBy
    const threadsSnapshot = await db.collection("threads")
      .where("communityId", "==", communityId)
      .orderBy("createdAt", "desc")
      .get();

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


/**
 * Obtener un hilo por su ID.
 * threadId se obtiene de req.params.
 */
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
      thread: { id: threadDoc.id, ...threadDoc.data() },
    });
  } catch (error) {
    console.error("Error al obtener el hilo:", error);
    return handleErrorResponse(res, 500, "Error al obtener el hilo", error.message);
  }
};
