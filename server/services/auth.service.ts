import { User } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface AuthResult {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
}

export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'favisend_default_secret_key';
  }

  /**
   * Enregistre un nouvel utilisateur
   */
  async register(userData: UserData): Promise<AuthResult> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          return { success: false, message: 'Cet email est déjà utilisé' };
        }
        return { success: false, message: 'Ce nom d\'utilisateur est déjà utilisé' };
      }

      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Créer le nouvel utilisateur
      const newUser = new User({
        ...userData,
        password: hashedPassword
      });

      // Sauvegarder l'utilisateur
      const savedUser = await newUser.save();
      
      // Générer le token JWT
      const token = this.generateToken(savedUser._id);

      return {
        success: true,
        user: this.sanitizeUser(savedUser),
        token
      };
    } catch (error) {
      console.error('Erreur d\'enregistrement:', error);
      return { success: false, message: 'Erreur lors de l\'enregistrement. Veuillez réessayer.' };
    }
  }

  /**
   * Authentifie un utilisateur avec email/mot de passe
   */
  async login(username: string, password: string): Promise<AuthResult> {
    try {
      // Trouver l'utilisateur par son nom d'utilisateur ou email
      const user = await User.findOne({
        $or: [{ username }, { email: username }]
      });

      if (!user) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return { success: false, message: 'Mot de passe incorrect' };
      }

      // Générer le token JWT
      const token = this.generateToken(user._id);

      return {
        success: true,
        user: this.sanitizeUser(user),
        token
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, message: 'Erreur lors de la connexion. Veuillez réessayer.' };
    }
  }

  /**
   * Génère un token JWT
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: '7d' });
  }

  /**
   * Vérifie la validité d'un token JWT
   */
  verifyToken(token: string): { valid: boolean; userId?: string } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      return { valid: true, userId: decoded.userId };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Supprime les données sensibles de l'utilisateur
   */
  private sanitizeUser(user: any) {
    const sanitized = user.toObject ? user.toObject() : { ...user };
    delete sanitized.password;
    return sanitized;
  }
}

export const authService = new AuthService();
