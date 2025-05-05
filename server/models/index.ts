import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Variable pour stocker l'instance MongoMemoryServer
let mongoMemoryServer: MongoMemoryServer | null = null;

// Schéma utilisateur
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, default: null },
  photoURL: { type: String, default: null },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Schéma fichier
const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  downloadUrl: { type: String, required: true },
  shareUrl: { type: String, required: true, unique: true },
  tags: [{ type: String }],
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Schéma téléchargement
const downloadSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, default: null },
  earnings: { type: Number, default: 450 }, // 450F CFA par défaut
  createdAt: { type: Date, default: Date.now }
});

// Schéma commentaire
const commentSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Schéma paiement
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, default: null },
  details: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

// Export des modèles
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const File = mongoose.models.File || mongoose.model('File', fileSchema);
export const Download = mongoose.models.Download || mongoose.model('Download', downloadSchema);
export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

// Connection à MongoDB
export async function connectToMongoDB() {
  // Utilisation de MongoMemoryServer pour le développement par défaut dans Replit
  if (process.env.NODE_ENV === 'development' || !process.env.MONGODB_URI) {
    try {
      console.log('Initialisation de la base de données MongoDB en mémoire...');
      
      // Création de l'instance MongoMemoryServer si elle n'existe pas encore
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create();
        const mongoUri = mongoMemoryServer.getUri();
        console.log(`URI MongoDB en mémoire: ${mongoUri}`);
        
        // Connexion à la base en mémoire
        await mongoose.connect(mongoUri);
        console.log('Connecté à la base MongoDB en mémoire');
      } else {
        console.log('Utilisation de l\'instance MongoDB en mémoire existante');
      }
      
      return mongoose.connection;
    } catch (memoryError) {
      console.error('Erreur avec MongoDB en mémoire:', memoryError);
      throw memoryError; // Ré-émission de l'erreur
    }
  }

  // Pour la production, on utilise l'URI MongoDB fourni
  try {
    const mongoURI = process.env.MONGODB_URI as string;
    await mongoose.connect(mongoURI);
    console.log('Connecté à MongoDB (production)');
    return mongoose.connection;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB (production):', error);
    throw error; // Ré-émission de l'erreur pour la gestion en amont
  }
}
