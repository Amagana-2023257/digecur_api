import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { swaggerDocs, swaggerUi } from "./swagger.js";
import apiLimiter from "../src/middlewares/rate-limit-validator.js";
import authRoutes from "../src/auth/auth.routes.js";
import userRoutes from "../src/user/user.routes.js";
import communityRoutes from "../src/community/community.routes.js";
import threadRoutes from "../src/thread/thread.routes.js";
import commentRoutes from "../src/comment/comment.routes.js";
import dotenv from "dotenv";
import "../configs/firebase.js";
dotenv.config();

const { PORT } = process.env;

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(apiLimiter);
};

const routes = (app) => {
  app.use("/digecur/v1/auth", authRoutes);
  app.use("/digecur/v1/user", userRoutes);
  app.use("/digecur/v1/community", communityRoutes);
  app.use("/digecur/v1/thread", threadRoutes);
  app.use("/digecur/v1/comment", commentRoutes);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

const conectarDB = async () => {
  try {
    console.log("Firebase Firestore conectado");
  } catch (err) {
    console.log(`Error en la conexión con Firestore: ${err}`);
    process.exit(1);
  }
};

export const initServer = () => {
  const app = express();
  try {
    middlewares(app);
    conectarDB();
    routes(app);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(`Error en la inicialización del servidor: ${err}`);
  }
};
