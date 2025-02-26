import { body } from "express-validator";

export const commentValidator = [
  body("threadId")
    .notEmpty().withMessage("El ID del hilo es requerido"),
  body("content")
    .notEmpty().withMessage("El contenido es requerido")
];
