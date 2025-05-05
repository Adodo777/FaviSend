import mongoose from 'mongoose';

// Utilisateur
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  photoURL: { type: String },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Fichier
const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
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

// Téléchargement
const downloadSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  earnings: { type: Number, default: 450 }, // 450F CFA par défaut
  createdAt: { type: Date, default: Date.now }
});

// Commentaire
const commentSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Paiement
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Export des modèles
export const User = mongoose.model('User', userSchema);
export const File = mongoose.model('File', fileSchema);
export const Download = mongoose.model('Download', downloadSchema);
export const Comment = mongoose.model('Comment', commentSchema);
export const Payment = mongoose.model('Payment', paymentSchema);

// Fonction d'initialisation de MongoDB
export async function connectToMongoDB(): Promise<void> {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/favisend';
    await mongoose.connect(mongoURI);
    console.log('Connecté à MongoDB');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    throw error;
  }
}
