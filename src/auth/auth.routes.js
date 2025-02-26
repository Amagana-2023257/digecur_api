import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { registerValidator, loginValidator } from "../middlewares/user-validators.js";
import { uploadProfilePicture } from "../middlewares/multer-uploads.js"; // Se usa el middleware unificado

const router = Router();

router.post(
  "/register",
  uploadProfilePicture.single("profilePicture"), 
  registerValidator, 
  register
);

// Ruta para inicio de sesión
router.post(
  "/login",
  loginValidator,
  login
);

export default router;
