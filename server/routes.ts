import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileController } from "./controllers/file.controller";
import { userController } from "./controllers/user.controller";
import { authController } from "./controllers/auth.controller";
import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth.middleware";
import { uploadMiddleware } from "./middleware/upload.middleware";
import { connectToMongoDB } from "./models";
import multer from "multer";
import path from "path";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialisation de la connexion MongoDB - gérée dans la fonction connectToMongoDB
  // qui renvoie une connexion en mémoire si la connexion réelle échoue
  try {
    await connectToMongoDB();
    log('Connexion à MongoDB établie', 'mongodb');
  } catch (error) {
    log('Utilisation d\'une base de données en mémoire (fallback)', 'mongodb');
  }
  // Configure multer storage
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads"));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
  });

  // Routes d'authentification
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/user", authMiddleware, authController.getCurrentUser);

  // User routes
  app.get("/api/users/current", authMiddleware, userController.getCurrentUser);

  // File routes
  app.post("/api/files", authMiddleware, uploadMiddleware.single("file"), fileController.createFile);
  app.get("/api/files", optionalAuthMiddleware, fileController.getFiles);
  app.get("/api/files/user", authMiddleware, fileController.getUserFiles);
  app.get("/api/files/detail/:shareUrl", optionalAuthMiddleware, fileController.getFileByShareUrl);
  app.post("/api/files/download/:shareUrl", optionalAuthMiddleware, fileController.downloadFile);
  app.delete("/api/files/:id", authMiddleware, fileController.deleteFile);

  // Comment routes
  app.post("/api/files/comment", authMiddleware, fileController.addComment);
  app.get("/api/files/:id/comments", optionalAuthMiddleware, fileController.getFileComments);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
