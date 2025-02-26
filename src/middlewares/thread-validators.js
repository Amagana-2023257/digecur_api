import { body } from "express-validator";

export const threadValidator = [
  body("communityId")
    .notEmpty().withMessage("El ID de la comunidad es requerido"),
  body("title")
    .notEmpty().withMessage("El título es requerido")
    .isLength({ min: 3 }).withMessage("El título debe tener al menos 3 caracteres"),
  body("content")
    .notEmpty().withMessage("El contenido es requerido")
];
