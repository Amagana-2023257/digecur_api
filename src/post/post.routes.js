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

const router = Router();

router.post("/", validateJWT, postValidator, createPost);
router.get("/", validateJWT, getAllPosts);
router.get("/:postId", validateJWT, getPostById);
router.put("/:postId", validateJWT, postValidator, updatePost);
router.delete("/:postId", validateJWT, deletePost);

export default router;
