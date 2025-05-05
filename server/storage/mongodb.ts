import { IStorage } from '../storage';
import { User as UserModel, File as FileModel, Download as DownloadModel, Comment as CommentModel, Payment as PaymentModel } from '../models/mongoose';
import bcrypt from 'bcrypt';
import { generateUniqueId } from '../utils';

// Déclaration module pour bcrypt
declare module 'bcrypt' {
  export function genSalt(rounds?: number): Promise<string>;
  export function hash(data: string, salt: string): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

export class MongooseStorage implements IStorage {
  constructor() {
    console.log('Stockage MongoDB initialisé');
  }

  // Gestion des utilisateurs
  async getUser(id: number): Promise<any | undefined> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      return undefined;
    }
  }

  async getUserByFirebaseUid(uid: string): Promise<any | undefined> {
    try {
      return await UserModel.findOne({ uid });
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      return await UserModel.findOne({ username });
    } catch (error) {
      return undefined;
    }
  }

  async createUser(userData: any): Promise<any> {
    // Hash du mot de passe
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const user = new UserModel(userData);
    return await user.save();
  }

  async updateUserBalance(userId: number, amount: number): Promise<any | undefined> {
    try {
      return await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount }, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      return undefined;
    }
  }

  // Gestion des fichiers
  async getFile(id: number): Promise<any | undefined> {
    try {
      return await FileModel.findById(id);
    } catch (error) {
      return undefined;
    }
  }

  async getFileByShareUrl(shareUrl: string): Promise<any | undefined> {
    try {
      return await FileModel.findOne({ shareUrl });
    } catch (error) {
      return undefined;
    }
  }

  async getUserFiles(userId: number): Promise<any[]> {
    try {
      return await FileModel.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      return [];
    }
  }

  async createFile(fileData: any, userId: number): Promise<any> {
    const newFile = new FileModel({
      ...fileData,
      userId,
      shareUrl: generateUniqueId(10)
    });
    return await newFile.save();
  }

  async updateFile(id: number, data: any): Promise<any | undefined> {
    try {
      return await FileModel.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      return undefined;
    }
  }

  async deleteFile(id: number): Promise<boolean> {
    try {
      const result = await FileModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // Liste des fichiers
  async getPopularFiles(limit: number = 10): Promise<any[]> {
    try {
      return await FileModel.find().sort({ downloads: -1 }).limit(limit);
    } catch (error) {
      return [];
    }
  }

  async getRecentFiles(limit: number = 10): Promise<any[]> {
    try {
      return await FileModel.find().sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      return [];
    }
  }

  async getTopRatedFiles(limit: number = 10): Promise<any[]> {
    try {
      return await FileModel.find().sort({ rating: -1 }).limit(limit);
    } catch (error) {
      return [];
    }
  }

  // Téléchargements
  async recordDownload(downloadData: any): Promise<any> {
    const download = new Download(downloadData);
    await download.save();
    
    // Mettre à jour le compteur de téléchargements du fichier
    await File.findByIdAndUpdate(
      downloadData.fileId, 
      { $inc: { downloads: 1 } }
    );
    
    // Mettre à jour le solde de l'utilisateur si c'est pertinent
    if (download.earnings > 0 && downloadData.fileId) {
      const file = await File.findById(downloadData.fileId);
      if (file && file.userId) {
        await this.updateUserBalance(file.userId, download.earnings);
      }
    }
    
    return download;
  }

  async getFileDownloads(fileId: number): Promise<any[]> {
    try {
      return await Download.find({ fileId }).sort({ createdAt: -1 });
    } catch (error) {
      return [];
    }
  }

  async getUserDownloads(userId: number): Promise<any[]> {
    try {
      const userFiles = await File.find({ userId }).select('_id');
      const fileIds = userFiles.map(file => file._id);
      return await Download.find({ fileId: { $in: fileIds } }).sort({ createdAt: -1 });
    } catch (error) {
      return [];
    }
  }

  // Commentaires
  async getFileComments(fileId: number): Promise<any[]> {
    try {
      return await Comment.find({ fileId })
        .populate('userId', 'username displayName photoURL')
        .sort({ createdAt: -1 });
    } catch (error) {
      return [];
    }
  }

  async createComment(commentData: any): Promise<any> {
    const comment = new Comment(commentData);
    await comment.save();
    
    // Mettre à jour la note moyenne du fichier si une note est donnée
    if (commentData.rating > 0) {
      const file = await File.findById(commentData.fileId);
      if (file) {
        const totalRatings = file.totalRatings + 1;
        const newRating = ((file.rating * file.totalRatings) + commentData.rating) / totalRatings;
        await File.findByIdAndUpdate(
          commentData.fileId,
          { rating: newRating, totalRatings: totalRatings }
        );
      }
    }
    
    return comment;
  }

  // Paiements
  async createPayment(paymentData: any): Promise<any> {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<any | undefined> {
    try {
      const updates: any = { status };
      
      if (transactionId) {
        updates.transactionId = transactionId;
      }
      
      if (status === 'completed') {
        updates.completedAt = new Date();
      }
      
      return await Payment.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
      return undefined;
    }
  }

  async getUserPayments(userId: number): Promise<any[]> {
    try {
      return await Payment.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      return [];
    }
  }
}