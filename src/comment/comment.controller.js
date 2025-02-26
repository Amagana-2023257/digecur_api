import { admin } from "../../configs/firebase.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";

// Crear un comentario en un hilo
export const createComment = async (req, res) => {
  try {
    const { threadId, content } = req.body;
    const authorId = req.usuario.uid;
    const commentData = {
      threadId,
      content,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = admin.firestore();
    const commentRef = await db.collection("comments").add(commentData);

    return res.status(201).json({
      success: true,
      message: "Comentario creado exitosamente",
      comment: { id: commentRef.id, ...commentData },
    });
  } catch (error) {
    console.error("Error al crear el comentario:", error);
    return handleErrorResponse(res, 500, "Error al crear el comentario", error.message);
  }
};

// Listar comentarios por hilo
export const getCommentsByThread = async (req, res) => {
  const { threadId } = req.params;
  try {
    const db = admin.firestore();
    const commentsSnapshot = await db.collection("comments").where("threadId", "==", threadId).get();
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json({
      success: true,
      message: "Comentarios obtenidos exitosamente",
      comments,
    });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return handleErrorResponse(res, 500, "Error al obtener comentarios", error.message);
  }
};
