import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  /**
   * Inscription d'un utilisateur
   */
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, displayName } = req.body;
      
      // Vérifier que les champs requis sont présents
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
      }

      // Enregistrer l'utilisateur
      const result = await authService.register({
        username,
        email,
        password,
        displayName: displayName || username,
      });

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      // Renvoyer l'utilisateur et le token
      res.status(201).json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  },

  /**
   * Connexion d'un utilisateur
   */
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      
      // Vérifier que les champs requis sont présents
      if (!username || !password) {
        return res.status(400).json({ message: 'Le nom d\'utilisateur et le mot de passe sont requis' });
      }

      // Connecter l'utilisateur
      const result = await authService.login(username, password);

      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }

      // Renvoyer l'utilisateur et le token
      res.status(200).json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }
      
      res.status(200).json(req.user);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  },

  /**
   * Déconnexion (côté client)
   */
  async logout(req: Request, res: Response) {
    // La déconnexion est gérée côté client en supprimant le token
    res.status(200).json({ message: 'Déconnexion réussie' });
  }
};
