import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
  // Si on est en développement et que MONGODB_URI n'est pas défini, on utilise mongoose-memory-server
  if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
    console.log('Utilisation de la base de données en mémoire pour le développement');
    // Pour le développement, on utilise une base en mémoire
    return mongoose.createConnection('mongodb://localhost:27017/favisend');
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/favisend';
    // Définition d'un timeout court pour la connexion
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 secondes de timeout
    });
    console.log('Connecté à MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    // En cas d'erreur, on retourne une connexion en mémoire pour le développement
    console.log('Fallback vers une base en mémoire');
    return mongoose.createConnection('mongodb://localhost:27017/favisend');
  }
}
