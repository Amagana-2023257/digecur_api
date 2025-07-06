import { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from "./post.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { hasRoles } from "../middlewares/validate-roles.js";
import { postValidator } from "../middlewares/post-validators.js";
import { uploadPostImage } from "../middlewares/multer-uploads.js";

const router = Router();

// Crear post con imagen opcional en campo "postImage"
router.post(
  "/",
  validateJWT,
  uploadPostImage,
  postValidator,
  hasRoles("ADMIN", "USER"),
  createPost
);

router.get("/", getAllPosts);
router.get("/:postId", validateJWT, getPostById);

// Actualizar post (también permite reemplazar imagen)
router.put(
  "/:postId",
  validateJWT,
  uploadPostImage,
  postValidator,
  hasRoles("ADMIN", "USER"),
  updatePost
);

router.delete(
  "/:postId",
  validateJWT,
  hasRoles("ADMIN", "USER"),
  deletePost
);

export default router;
