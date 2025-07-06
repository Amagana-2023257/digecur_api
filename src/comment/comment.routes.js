// src/routes/comment.routes.js

import { Router } from "express";
import {
  createComment,
  getCommentsByThread,
  updateComment,
  deleteComment
} from "./comment.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
// import { hasRoles } from "../middlewares/validate-roles.js"; // si deseas roles


const router = Router();

/**
 * Crear comentario (autenticado).
 * - POST /comment
 *   Body: { threadId, content }
 */
router.post("/", validateJWT, createComment);

/**
 * Listar comentarios de un hilo.
 * - GET /comment/thread/:threadId
 */
router.get("/thread/:threadId", validateJWT, getCommentsByThread);

/**
 * Actualizar un comentario.
 * - PUT /comment/:commentId
 *   Body: { content }
 */
router.put("/:commentId", validateJWT, updateComment);

/**
 * Eliminar un comentario.
 * - DELETE /comment/:commentId
 */
router.delete("/:commentId", validateJWT, deleteComment);

export default router;
