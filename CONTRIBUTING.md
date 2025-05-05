# Guide de contribution à FaviSend

Merci de votre intérêt pour contribuer à FaviSend ! Ce document contient des instructions détaillées pour configurer l'environnement de développement et contribuer au projet.

## Prérequis

- Node.js 18+ et npm
- Un éditeur de code (VS Code recommandé)
- Un compte Firebase pour l'authentification

## Installation

1. **Clonez le dépôt :**
   ```bash
   git clone <URL_DU_DEPOT>
   cd favisend
   ```

2. **Installez les dépendances :**
   ```bash
   npm install
   ```

3. **Créez un fichier .env :**
   ```bash
   cp .env.example .env
   ```

4. **Configurez Firebase :**
   - Créez un projet dans la [console Firebase](https://console.firebase.google.com/)
   - Activez l'authentification Google dans votre projet
   - Ajoutez l'URL de développement local (http://localhost:5000) dans la liste des domaines autorisés
   - Récupérez les clés (apiKey, projectId, appId) et complétez votre fichier .env

5. **Créez le dossier uploads :**
   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

6. **Démarrez le serveur de développement :**
   ```bash
   npm run dev
   ```

## Structure du projet

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

## Bonnes pratiques de développement

### Frontend

- Utilisez les composants de shadcn/ui pour l'interface utilisateur
- Respectez l'architecture des fichiers existante
- Utilisez les hooks personnalisés existants
- Testez sur mobile et desktop

### Backend

- Gardez les contrôleurs légers, utilisez des services pour la logique métier
- Validez toujours les données entrantes avec zod
- Utilisez l'interface IStorage pour les opérations de base de données

### Général

- Respectez le style de code existant
- Documentez vos fonctions et composants
- Écrivez des messages de commit clairs

## Base de données

Le projet utilise actuellement un stockage en mémoire. Lorsque vous souhaitez passer à PostgreSQL :

1. Configurez la variable `DATABASE_URL` dans .env
2. Exécutez le script de migration :
   ```bash
   node scripts/db-setup.js
   ```

## Processus de contribution

1. Créez une branche pour votre fonctionnalité
2. Développez et testez vos modifications
3. Soumettez une Pull Request
4. Attendez la revue de code

## Conseils pour le débogage

- Utilisez les outils de développement du navigateur
- Vérifiez les logs du serveur Express
- Pour les problèmes d'authentification Firebase, vérifiez la console Firebase

## Contact

Pour toute question, contactez [contact@favisend.com](mailto:contact@favisend.com)