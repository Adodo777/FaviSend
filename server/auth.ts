import session from 'express-session';
import { Express, Request, Response, NextFunction } from 'express';
import { User } from './models';
import bcrypt from 'bcrypt';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: string;
      username: string;
      email: string;
      displayName: string | null;
      photoURL: string | null;
      balance: number;
      createdAt: Date;
      updatedAt: Date;
    }

    interface Request {
      user?: Express.User;
    }
  }
}

// Étendre l'interface Session pour inclure userId
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  return await bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // Vérifiez que la connexion MongoDB est active
  if (!mongoose.connection.readyState) {
    throw new Error('La connexion à MongoDB n\'est pas active. Assurez-vous que connectToMongoDB() a été appelé.');
  }

  const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessions',
    stringify: false,
    ttl: 14 * 24 * 60 * 60, // 14 jours
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'favisend_session_secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 jours
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  };

  app.use(session(sessionSettings));

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
      }

      // Créer un nouvel utilisateur
      const newUser = new User({
        username,
        email,
        password: await hashPassword(password),
        displayName: username,
        photoURL: null,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newUser.save();

      // Créer une session utilisateur
      req.session.userId = newUser._id;

      // Renvoyer les informations utilisateur (sans le mot de passe)
      const userObject = newUser.toObject();
      delete userObject.password;

      res.status(201).json(userObject);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
      }

      // Trouver l'utilisateur par nom d'utilisateur ou email
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!user) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      // Vérifier le mot de passe
      const passwordMatch = await comparePasswords(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      // Créer une session utilisateur
      req.session.userId = user._id;

      // Renvoyer les informations utilisateur (sans le mot de passe)
      const userObject = user.toObject();
      delete userObject.password;

      res.status(200).json(userObject);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la déconnexion:', err);
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      res.status(200).json({ message: 'Déconnexion réussie' });
    });
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Accès non autorisé' });
      }

      const user = await User.findById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      // Renvoyer les informations utilisateur (sans le mot de passe)
      const userObject = user.toObject();
      delete userObject.password;

      res.status(200).json(userObject);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Middleware pour charger l'utilisateur dans req.user pour les autres routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return next();
    }

    User.findById(req.session.userId)
      .then((user) => {
        if (user) {
          const userObject = user.toObject();
          delete userObject.password;
          req.user = userObject;
        }
        next();
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        next();
      });
  });
}