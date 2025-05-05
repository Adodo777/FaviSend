/**
 * Script de configuration de la base de données PostgreSQL
 * À utiliser lorsque le projet passe de MemStorage à une base de données PostgreSQL
 */

const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
const { join } = require('path');

// Récupération des variables d'environnement
require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;

async function runMigration() {
  if (!DATABASE_URL) {
    console.error('⛔ La variable DATABASE_URL n\'est pas définie dans le fichier .env');
    console.log('📝 Exemple: DATABASE_URL=postgresql://utilisateur:motdepasse@localhost:5432/favisend');
    process.exit(1);
  }
  
  console.log('🔄 Démarrage de la migration...');
  
  try {
    // Connexion à la base de données
    const client = postgres(DATABASE_URL);
    const db = drizzle(client);
    
    // Exécution des migrations
    await migrate(db, { migrationsFolder: join(__dirname, '../drizzle') });
    
    console.log('✅ Migration réussie!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur pendant la migration:', error);
    process.exit(1);
  }
}

runMigration();
