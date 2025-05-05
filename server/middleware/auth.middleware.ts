import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { User } from '../models';

// Extension de l'interface Request pour inclure l'utilisateur
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Récupérer le token d'authentification de l'en-tête
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Accès non autorisé' });
        }

        // Extraire le token
        const token = authHeader.split(' ')[1];
        
        // Vérifier le token
        const { valid, userId } = authService.verifyToken(token);
        if (!valid || !userId) {
            return res.status(401).json({ message: 'Token invalide ou expiré' });
        }

        // Récupérer l'utilisateur depuis la base de données
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Attacher l'utilisateur et le token à l'objet request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Middleware pour vérifier si un utilisateur est connecté, mais continue même si non
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Récupérer le token d'authentification de l'en-tête
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continue sans utilisateur authentifié
        }

        // Extraire le token
        const token = authHeader.split(' ')[1];
        
        // Vérifier le token
        const { valid, userId } = authService.verifyToken(token);
        if (!valid || !userId) {
            return next(); // Continue sans utilisateur authentifié
        }

        // Récupérer l'utilisateur depuis la base de données
        const user = await User.findById(userId);
        if (user) {
            // Attacher l'utilisateur et le token à l'objet request
            req.user = user;
            req.token = token;
        }

        next();
    } catch (error) {
        // En cas d'erreur, continuez simplement sans utilisateur authentifié
        next();
    }
};
