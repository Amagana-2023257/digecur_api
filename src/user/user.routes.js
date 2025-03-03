import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  deleteUser
} from "./user.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { hasRoles } from "../middlewares/validate-roles.js";
import { uploadProfilePicture } from "../middlewares/multer-uploads.js"; // <-- Nuevo middleware
import { updateUserValidator, deleteUserValidator } from "../middlewares/user-validators.js";

const router = Router();

// Obtener todos los usuarios (solo ADMIN)
router.get("/", validateJWT, hasRoles("ADMIN"), getAllUsers);

// Obtener un usuario por su ID (ADMIN o USER)
router.get("/:userId", validateJWT, hasRoles("ADMIN", "USER"), getUserById);

// Actualizar un usuario
router.put(
    "/:userId",
    validateJWT,
    hasRoles("ADMIN", "USER"),
    uploadProfilePicture,   // <-- Usas el middleware tal cual, sin .single()
    updateUserValidator,
    updateUser
  );
  

// Desactivar un usuario (borrado lógico, solo ADMIN)
router.put("/:userId/deactivate", validateJWT, hasRoles("ADMIN"), deactivateUser);

// Eliminar un usuario (borrado físico, solo ADMIN)
router.delete("/:userId", validateJWT, hasRoles("ADMIN"), deleteUserValidator, deleteUser);

export default router;
