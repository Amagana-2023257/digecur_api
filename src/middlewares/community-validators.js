import { body } from "express-validator";

export const communityValidator = [
  body("name")
    .notEmpty().withMessage("El nombre de la comunidad es requerido"),
  body("description")
    .optional()
    .isString().withMessage("La descripción debe ser texto"),
  body("department")
    .notEmpty().withMessage("El departamento es requerido")
];
