import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertFileSchema, insertCommentSchema } from '@shared/schema';
import { generateUniqueId } from '../utils';
import path from 'path';
import fs from 'fs';
import { getFirebaseStorage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const fileController = {
  // Create a new file
  async createFile(req: Request, res: Response) {
    try {
      // Validate the request body
      const validation = insertFileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid file data', errors: validation.error.errors });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if there's a file attachment from multer
      if (req.file) {
        // Upload to Firebase Storage if file is available
        const storageRef = ref(getFirebaseStorage(), `uploads/${userId}/${Date.now()}-${req.file.originalname}`);
        const fileBuffer = fs.readFileSync(req.file.path);
        const snapshot = await uploadBytes(storageRef, fileBuffer);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // Remove temp file
        fs.unlinkSync(req.file.path);

        // Use the Firebase download URL
        req.body.downloadUrl = downloadUrl;
        req.body.fileName = req.file.originalname;
        req.body.fileSize = req.file.size;
        req.body.fileType = req.file.mimetype;
      }

      // Create file in database
      const file = await storage.createFile(validation.data, userId);
      res.status(201).json(file);
    } catch (error) {
      console.error('Error creating file:', error);
      res.status(500).json({ message: 'Failed to create file', error: (error as Error).message });
    }
  },

  // Get files with filter (popular, recent, topRated)
  async getFiles(req: Request, res: Response) {
    try {
      const filter = req.query.filter as string || 'popular';
      const limit = parseInt(req.query.limit as string || '50');

      let files;
      switch (filter) {
        case 'recent':
          files = await storage.getRecentFiles(limit);
          break;
        case 'topRated':
          files = await storage.getTopRatedFiles(limit);
          break;
        case 'popular':
        default:
          files = await storage.getPopularFiles(limit);
          break;
      }

      // For each file, fetch the user who uploaded it
      const filesWithUser = await Promise.all(
        files.map(async (file) => {
          const user = await storage.getUser(file.userId);
          return {
            ...file,
            user: user ? {
              id: user.id,
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL
            } : null
          };
        })
      );

      res.json(filesWithUser);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Failed to fetch files', error: (error as Error).message });
    }
  },

  // Get files for the current user
  async getUserFiles(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const files = await storage.getUserFiles(userId);
      res.json(files);
    } catch (error) {
      console.error('Error fetching user files:', error);
      res.status(500).json({ message: 'Failed to fetch user files', error: (error as Error).message });
    }
  },

  // Get file by share URL
  async getFileByShareUrl(req: Request, res: Response) {
    try {
      const shareUrl = req.params.shareUrl;
      const file = await storage.getFileByShareUrl(shareUrl);

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Get file owner
      const user = await storage.getUser(file.userId);
      // Get comments for the file
      const comments = await storage.getFileComments(file.id);

      // For each comment, fetch the user who wrote it
      const commentsWithUser = await Promise.all(
        comments.map(async (comment) => {
          const commentUser = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: commentUser ? {
              id: commentUser.id,
              uid: commentUser.uid,
              displayName: commentUser.displayName,
              photoURL: commentUser.photoURL
            } : null
          };
        })
      );

      // Return file with owner and comments
      res.json({
        ...file,
        user: user ? {
          id: user.id,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        } : null,
        comments: commentsWithUser
      });
    } catch (error) {
      console.error('Error fetching file by share URL:', error);
      res.status(500).json({ message: 'Failed to fetch file', error: (error as Error).message });
    }
  },

  // Download a file
  async downloadFile(req: Request, res: Response) {
    try {
      const shareUrl = req.params.shareUrl;
      const userId = req.user?.id;

      const file = await storage.getFileByShareUrl(shareUrl);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Record the download
      await storage.recordDownload({
        fileId: file.id,
        userId: userId || null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        earnings: 450 // 450 CFA per download
      });

      // Return the download URL
      res.json({ downloadUrl: file.downloadUrl });
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ message: 'Failed to download file', error: (error as Error).message });
    }
  },

  // Delete a file
  async deleteFile(req: Request, res: Response) {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user?.id;

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Ensure the user owns the file
      if (file.userId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this file' });
      }

      // Delete the file
      await storage.deleteFile(fileId);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Failed to delete file', error: (error as Error).message });
    }
  },

  // Add a comment to a file
  async addComment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Validate request body
      const validation = insertCommentSchema.safeParse({
        ...req.body,
        userId
      });

      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid comment data', errors: validation.error.errors });
      }

      // Check if the file exists
      const file = await storage.getFile(req.body.fileId);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Create the comment
      const comment = await storage.createComment(validation.data);
      
      // Get the user for the response
      const user = await storage.getUser(userId);
      
      // Return comment with user data
      res.status(201).json({
        ...comment,
        user: {
          id: user?.id,
          uid: user?.uid,
          displayName: user?.displayName,
          photoURL: user?.photoURL
        }
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Failed to add comment', error: (error as Error).message });
    }
  },

  // Get comments for a file
  async getFileComments(req: Request, res: Response) {
    try {
      const fileId = parseInt(req.params.id);
      
      // Check if the file exists
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Get comments
      const comments = await storage.getFileComments(fileId);
      
      // For each comment, fetch the user who wrote it
      const commentsWithUser = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? {
              id: user.id,
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL
            } : null
          };
        })
      );
      
      res.json(commentsWithUser);
    } catch (error) {
      console.error('Error fetching file comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments', error: (error as Error).message });
    }
  }
};
