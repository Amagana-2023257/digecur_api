import { Router } from "express";
import { createThread, getThreadsByCommunity, getThreadById } from "./thread.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { threadValidator } from "../middlewares/thread-validators.js";

const router = Router();

// Crear hilo (se requiere autenticación)
router.post("/", validateJWT, threadValidator, createThread);

// Listar hilos por comunidad
router.get("/community/:communityId", validateJWT, getThreadsByCommunity);

// Obtener hilo por ID
router.get("/:threadId", validateJWT, getThreadById);

export default router;
