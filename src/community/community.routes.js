// src/routes/community.routes.js

import { Router } from "express";
import {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  deleteCommunity
} from "./community.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { hasRoles } from "../middlewares/validate-roles.js";
import { communityValidator } from "../middlewares/community-validators.js";
import { uploadCommunityPicture } from "../middlewares/multer-uploads.js";


const router = Router();

/**
 * Crear comunidad con foto (campo "communityPicture").
 * Solo usuarios autenticados.
 */
router.post(
  "/",
  validateJWT,
  uploadCommunityPicture, // Maneja el archivo "communityPicture"
  communityValidator,
  createCommunity
);

/**
 * Listar comunidades (requiere autenticación).
 */
router.get("/", validateJWT, getAllCommunities);

/**
 * Obtener comunidad por ID.
 */
router.get("/:communityId", validateJWT, getCommunityById);

/**
 * Unirse a una comunidad (POST /community/:communityId/join).
 */
router.post("/:communityId/join", validateJWT, joinCommunity);

/**
 * Salir de una comunidad (POST /community/:communityId/leave).
 */
router.post("/:communityId/leave", validateJWT, leaveCommunity);

/**
 * Actualizar comunidad (nombre, descripción, dept, etc.).
 * Roles "ADMIN" o "USER".
 */
router.put(
  "/:communityId",
  validateJWT,
  hasRoles("ADMIN", "USER"),
  communityValidator,
  updateCommunity
);

/**
 * Eliminar comunidad (solo "ADMIN").
 */
router.delete(
  "/:communityId",
  validateJWT,
  hasRoles("ADMIN"),
  deleteCommunity
);

export default router;
