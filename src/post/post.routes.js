import { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from "./post.controller.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { postValidator } from "../middlewares/post-validators.js"; // Opcional: para validar campos del post
import { hasRoles } from "../middlewares/validate-roles.js";

const router = Router();

router.post("/", validateJWT,hasRoles("ADMIN", "USER"), postValidator, createPost);
router.get("/", getAllPosts);
router.get("/:postId", validateJWT, getPostById);
router.put("/:postId", validateJWT,hasRoles("ADMIN", "USER"), postValidator, updatePost);
router.delete("/:postId", validateJWT,hasRoles("ADMIN", "USER"), deletePost);

export default router;

