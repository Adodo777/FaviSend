import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';

export const userController = {
  // Create or update a user from Firebase auth data
  async createOrUpdateUser(req: Request, res: Response) {
    try {
      // Validate the request body
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid user data', errors: validation.error.errors });
      }

      // Check if the user already exists by Firebase UID
      const existingUser = await storage.getUserByFirebaseUid(req.body.uid);
      
      if (existingUser) {
        // Update user (currently no update functionality in storage, would need to implement)
        res.json(existingUser);
      } else {
        // Create new user
        const newUser = await storage.createUser(validation.data);
        res.status(201).json(newUser);
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ message: 'Failed to create/update user', error: (error as Error).message });
    }
  },

  // Get the current authenticated user
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      res.json(req.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ message: 'Failed to fetch current user', error: (error as Error).message });
    }
  }
};
