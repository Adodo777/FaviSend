import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileController } from "./controllers/file.controller";
import { userController } from "./controllers/user.controller";
import { authMiddleware } from "./middleware/auth.middleware";
import { uploadMiddleware } from "./middleware/upload.middleware";
import multer from "multer";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // User routes
  app.post("/api/users", userController.createOrUpdateUser);
  app.get("/api/users/current", authMiddleware, userController.getCurrentUser);

  // File routes
  app.post("/api/files", authMiddleware, uploadMiddleware.single("file"), fileController.createFile);
  app.get("/api/files", fileController.getFiles);
  app.get("/api/files/user", authMiddleware, fileController.getUserFiles);
  app.get("/api/files/detail/:shareUrl", fileController.getFileByShareUrl);
  app.post("/api/files/download/:shareUrl", authMiddleware, fileController.downloadFile);
  app.delete("/api/files/:id", authMiddleware, fileController.deleteFile);

  // Comment routes
  app.post("/api/files/comment", authMiddleware, fileController.addComment);
  app.get("/api/files/:id/comments", fileController.getFileComments);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
