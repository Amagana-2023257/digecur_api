// src/controllers/comment.controller.js

import { admin } from "../../configs/firebase.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";

/**
 * Crea un comentario en un hilo.
 * El usuario autenticado se obtiene de req.usuario.uid.
 */
export const createComment = async (req, res) => {
  try {
    const { threadId, content } = req.body;
    const authorId = req.usuario.uid;

    // Validación básica
    if (!content) {
      return handleErrorResponse(res, 400, "El contenido del comentario es obligatorio");
    }

    const db = admin.firestore();

    // Verificar que el hilo existe
    const threadDoc = await db.collection("threads").doc(threadId).get();
    if (!threadDoc.exists) {
      return handleErrorResponse(res, 404, "Hilo no encontrado");
    }

    // Datos del comentario
    const commentData = {
      threadId,
      content,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar en Firestore
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

/**
 * Obtiene todos los comentarios de un hilo, ordenados por fecha de creación (desc).
 */
export const getCommentsByThread = async (req, res) => {
  const { threadId } = req.params;
  try {
    const db = admin.firestore();

    // Verificar que el hilo existe
    const threadDoc = await db.collection("threads").doc(threadId).get();
    if (!threadDoc.exists) {
      return handleErrorResponse(res, 404, "Hilo no encontrado");
    }

    // Obtener comentarios, ordenados por createdAt descendente
    const commentsSnapshot = await db.collection("comments")
      .where("threadId", "==", threadId)
      .orderBy("createdAt", "desc")
      .get();

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

/**
 * Actualiza un comentario por su ID.
 * - Solo el autor del comentario puede actualizarlo.
 */
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.usuario.uid; // Autor autenticado

  if (!content) {
    return handleErrorResponse(res, 400, "El contenido del comentario es obligatorio");
  }

  try {
    const db = admin.firestore();
    const commentRef = db.collection("comments").doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return handleErrorResponse(res, 404, "Comentario no encontrado");
    }

    const commentData = commentDoc.data();

    // Verificar que el autor actual sea el dueño del comentario
    if (commentData.authorId !== userId) {
      return handleErrorResponse(res, 403, "No tienes permiso para actualizar este comentario");
    }

    const updatedData = {
      content,
      updatedAt: new Date().toISOString(),
    };

    await commentRef.update(updatedData);

    return res.status(200).json({
      success: true,
      message: "Comentario actualizado exitosamente",
      comment: { id: commentId, ...commentData, ...updatedData },
    });
  } catch (error) {
    console.error("Error al actualizar el comentario:", error);
    return handleErrorResponse(res, 500, "Error al actualizar el comentario", error.message);
  }
};

/**
 * Elimina un comentario por su ID.
 * - Solo el autor del comentario puede eliminarlo.
 */
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.usuario.uid;

  try {
    const db = admin.firestore();
    const commentRef = db.collection("comments").doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return handleErrorResponse(res, 404, "Comentario no encontrado");
    }

    const commentData = commentDoc.data();

    // Verificar autoría
    if (commentData.authorId !== userId) {
      return handleErrorResponse(res, 403, "No tienes permiso para eliminar este comentario");
    }

    await commentRef.delete();

    return res.status(200).json({
      success: true,
      message: "Comentario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar el comentario:", error);
    return handleErrorResponse(res, 500, "Error al eliminar el comentario", error.message);
  }
};
