import { Router } from "express";
import { createComment, getCommentsByThread } from "./comment.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { commentValidator } from "../middlewares/comment-validators.js";

const router = Router();

// Crear comentario (autenticado)
router.post("/", validateJWT, commentValidator, createComment);

// Listar comentarios de un hilo
router.get("/thread/:threadId", validateJWT, getCommentsByThread);

export default router;
