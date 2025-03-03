// src/middlewares/post-validators.js
import { body } from 'express-validator';

export const postValidator = [
  // El título es obligatorio, se limpia y se limita a 100 caracteres
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 100 }).withMessage('El título debe tener máximo 100 caracteres'),

  // El contenido es obligatorio, se limpia y se requiere que tenga al menos 10 caracteres
  body('content')
    .trim()
    .notEmpty().withMessage('El contenido es obligatorio')
    .isLength({ min: 10 }).withMessage('El contenido debe tener al menos 10 caracteres'),
];
