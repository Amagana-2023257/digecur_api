import { Router } from "express";
import {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity
} from "./community.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js"; // Asegúrate de tenerlo
import { hasRoles } from "../middlewares/validate-roles.js"; // Para permisos
import { communityValidator } from "../middlewares/community-validators.js"; // Por ejemplo

const router = Router();

// Crear comunidad (solo usuarios autenticados)
router.post("/", validateJWT, communityValidator, createCommunity);

// Listar comunidades
router.get("/", validateJWT, getAllCommunities);

// Obtener comunidad por ID
router.get("/:communityId", validateJWT, getCommunityById);

// Actualizar comunidad (por admin de la comunidad o ADMIN global)
router.put("/:communityId", validateJWT, hasRoles("ADMIN", "USER"), communityValidator, updateCommunity);

// Eliminar comunidad (por ADMIN)
router.delete("/:communityId", validateJWT, hasRoles("ADMIN"), deleteCommunity);

export default router;
