import { Router } from "express";
import { getAllUsers, getUserById, updateUser, deactivateUser, deleteUser } from "./user.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { hasRoles } from "../middlewares/validate-roles.js";
import { uploadProfilePicture } from "../middlewares/multer-uploads.js";
import { updateUserValidator, deleteUserValidator } from "../middlewares/user-validators.js";

const router = Router();

// Obtener todos los usuarios
router.get("/", validateJWT, hasRoles("ADMIN"), getAllUsers);

// Obtener un usuario por su ID
router.get("/:userId", validateJWT, hasRoles("ADMIN", "USER"), getUserById);

// Actualizar un usuario
router.put("/:userId", uploadProfilePicture.single("profilePicture"), validateJWT, hasRoles("ADMIN", "USER"), updateUserValidator, updateUser);

// Desactivar un usuario (borrado lógico)
router.put("/:userId/deactivate", validateJWT, hasRoles("ADMIN"), deactivateUser);

// Eliminar un usuario (borrado físico)
router.delete("/:userId", validateJWT, hasRoles("ADMIN"), deleteUserValidator, deleteUser);

export default router;
