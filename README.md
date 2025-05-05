# FaviSend - Plateforme de Partage de Fichiers

FaviSend est une plateforme innovante de partage de fichiers qui permet aux utilisateurs de gagner 450F CFA par téléchargement. Cette application combine une interface utilisateur moderne et réactive avec des fonctionnalités de monétisation uniques.

## Fonctionnalités

- **Authentification Utilisateur** : Connexion via Google ou email/mot de passe
- **Téléchargement de Fichiers** : Interface simple pour partager vos fichiers
- **Monétisation** : Gagnez 450F CFA à chaque téléchargement de vos fichiers
- **Design Responsive** : Interface adaptée aux mobiles et aux ordinateurs
- **Tableau de Bord** : Suivez vos téléchargements et vos revenus

## Pile Technologique

- **Frontend** : React, TypeScript, TailwindCSS, Shadcn UI
- **Backend** : Express.js, Node.js
- **Authentification** : Firebase Auth
- **Stockage** : Stockage local avec Multer
- **Base de Données** : Prêt pour PostgreSQL avec Drizzle ORM

## Prérequis

- Node.js 18+ et npm
- Compte Firebase (pour l'authentification)

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/votre-nom/favisend.git
   cd favisend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Copiez le fichier `.env.example` en `.env`
   - Remplissez les valeurs avec vos informations Firebase

4. Configurez Firebase :
   - Créez un projet dans la [console Firebase](https://console.firebase.google.com/)
   - Activez l'authentification Google dans votre projet Firebase
   - Ajoutez l'URL de votre application dans la liste des domaines autorisés
   - Copiez les informations de configuration (apiKey, projectId, appId) dans votre fichier `.env`

## Démarrage

1. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```

2. Accédez à l'application dans votre navigateur :
   ```
   http://localhost:5000
   ```

## Déploiement

Pour déployer l'application sur un serveur de production :

1. Construisez l'application :
   ```bash
   npm run build
   ```

2. Démarrez le serveur en mode production :
   ```bash
   npm start
   ```

## Structure du Projet

```
├── client/            # Code frontend React
│   ├── src/           # Source code
│   │   ├── assets/    # Images, icônes, etc.
│   │   ├── components/# Composants React
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Bibliothèques et utilitaires
│   │   ├── pages/     # Pages de l'application
│   │   └── types/     # Définitions TypeScript
├── server/            # Code backend Express
│   ├── controllers/   # Contrôleurs des routes
│   ├── middleware/    # Middleware Express
│   └── services/      # Services métier
├── shared/            # Code partagé entre frontend et backend
│   └── schema.ts      # Schémas de données
└── uploads/           # Dossier pour les fichiers téléchargés
```

## Futures Améliorations

- Intégration complète de l'authentification par email/mot de passe
- Intégration de Mobile Money pour les paiements
- Stockage des fichiers dans le cloud
- Statistiques détaillées des téléchargements

## Auteur

Favisend Team

## Licence

Ce projet est sous licence MIT.