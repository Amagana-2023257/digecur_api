import { admin } from "../../configs/firebase.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";
import { uploadToCloudinary } from "../middlewares/multer-uploads.js";

/**
 * Crea una publicación — ahora con imagen opcional.
 */
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorId = req.usuario.uid;
    let postImageUrl = null;

    // Si subieron archivo, lo enviamos a Cloudinary
    if (req.file) {
      postImageUrl = await uploadToCloudinary(req, 'posts');
    }

    const postData = {
      title,
      content,
      authorId,
      postImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = admin.firestore();
    const postRef = await db.collection("posts").add(postData);

    return res.status(201).json({
      success: true,
      message: "Publicación creada exitosamente",
      post: { id: postRef.id, ...postData },
    });
  } catch (error) {
    console.error("Error al crear la publicación:", error);
    return handleErrorResponse(res, 500, "Error al crear la publicación", error.message);
  }
};

/**
 * Listar todas las publicaciones (sin cambios).
 */
export const getAllPosts = async (req, res) => {
  try {
    const db = admin.firestore();
    const postsSnapshot = await db.collection("posts")
      .orderBy("createdAt", "desc")
      .get();
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json({
      success: true,
      message: "Publicaciones obtenidas exitosamente",
      posts,
    });
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return handleErrorResponse(res, 500, "Error al obtener publicaciones", error.message);
  }
};

/**
 * Obtener publicación por ID (sin cambios).
 */
export const getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const db = admin.firestore();
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return handleErrorResponse(res, 404, "Publicación no encontrada");
    }
    return res.status(200).json({
      success: true,
      message: "Publicación obtenida exitosamente",
      post: postDoc.data(),
    });
  } catch (error) {
    console.error("Error al obtener la publicación:", error);
    return handleErrorResponse(res, 500, "Error al obtener la publicación", error.message);
  }
};

/**
 * Actualizar publicación — ahora con reemplazo de imagen opcional.
 */
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  try {
    const db = admin.firestore();
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      return handleErrorResponse(res, 404, "Publicación no encontrada");
    }

    const updatedData = {
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    // Si enviaron nueva imagen:
    if (req.file) {
      updatedData.postImageUrl = await uploadToCloudinary(req, 'posts');
    }

    await postRef.update(updatedData);

    return res.status(200).json({
      success: true,
      message: "Publicación actualizada exitosamente",
      post: updatedData,
    });
  } catch (error) {
    console.error("Error al actualizar la publicación:", error);
    return handleErrorResponse(res, 500, "Error al actualizar la publicación", error.message);
  }
};

/**
 * Eliminar publicación (sin cambios).
 */
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const db = admin.firestore();
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      return handleErrorResponse(res, 404, "Publicación no encontrada");
    }
    await postRef.delete();
    return res.status(200).json({
      success: true,
      message: "Publicación eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar la publicación:", error);
    return handleErrorResponse(res, 500, "Error al eliminar la publicación", error.message);
  }
};
