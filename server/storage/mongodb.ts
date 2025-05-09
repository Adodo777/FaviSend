import { IStorage } from '../storage';
import { User as UserModel, File as FileModel, Download as DownloadModel, Comment as CommentModel, Payment as PaymentModel } from '../models/mongoose';
import bcrypt from 'bcrypt';
import { generateUniqueId } from '../utils';

export class MongooseStorage implements IStorage {
  constructor() {
    console.log('Stockage MongoDB initialisé');
  }

  // Gestion des utilisateurs
  async getUser(id: number): Promise<any | undefined> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur :', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      return await UserModel.findOne({ username });
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur par nom d’utilisateur :', error);
      return undefined;
    }
  }

  async createUser(userData: any): Promise<any> {
    try {
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      const user = new UserModel(userData);
      return await user.save();
    } catch (error) {
      console.error('Erreur lors de la création de l’utilisateur :', error);
      throw error;
    }
  }

  async updateUserBalance(userId: number, amount: number): Promise<any | undefined> {
    try {
      return await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount }, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde utilisateur :', error);
      return undefined;
    }
  }

  // Gestion des fichiers
  async getFile(id: number): Promise<any | undefined> {
    try {
      return await FileModel.findById(id);
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier :', error);
      return undefined;
    }
  }

  async getFileByShareUrl(shareUrl: string): Promise<any | undefined> {
    try {
      return await FileModel.findOne({ shareUrl });
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier par URL de partage :', error);
      return undefined;
    }
  }

  async getUserFiles(userId: number): Promise<any[]> {
    try {
      return await FileModel.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers utilisateur :', error);
      return [];
    }
  }

  async createFile(fileData: any, userId: number): Promise<any> {
    try {
      const newFile = new FileModel({
        ...fileData,
        userId,
        shareUrl: generateUniqueId(10),
      });
      return await newFile.save();
    } catch (error) {
      console.error('Erreur lors de la création du fichier :', error);
      throw error;
    }
  }

  async updateFile(id: number, data: any): Promise<any | undefined> {
    try {
      return await FileModel.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier :', error);
      return undefined;
    }
  }

  async deleteFile(id: number): Promise<boolean> {
    try {
      const result = await FileModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier :', error);
      return false;
    }
  }

  // Téléchargements
  async recordDownload(downloadData: any): Promise<any> {
    try {
      const download = new DownloadModel(downloadData);
      await download.save();

      // Mettre à jour le compteur de téléchargements du fichier
      await FileModel.findByIdAndUpdate(
        downloadData.fileId,
        { $inc: { downloads: 1 } }
      );

      // Mettre à jour le solde de l'utilisateur si pertinent
      if (downloadData.earnings > 0 && downloadData.fileId) {
        const file = await FileModel.findById(downloadData.fileId);
        if (file && file.userId) {
          await this.updateUserBalance(file.userId, downloadData.earnings);
        }
      }

      return download;
    } catch (error) {
      console.error('Erreur lors de l’enregistrement du téléchargement :', error);
      throw error;
    }
  }

  async getFileDownloads(fileId: number): Promise<any[]> {
    try {
      return await DownloadModel.find({ fileId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des téléchargements du fichier :', error);
      return [];
    }
  }

  async getUserDownloads(userId: number): Promise<any[]> {
    try {
      const userFiles = await FileModel.find({ userId }).select('_id');
      const fileIds = userFiles.map((file) => file._id);
      return await DownloadModel.find({ fileId: { $in: fileIds } }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des téléchargements utilisateur :', error);
      return [];
    }
  }

  // Commentaires
  async getFileComments(fileId: number): Promise<any[]> {
    try {
      return await CommentModel.find({ fileId })
        .populate('userId', 'username displayName photoURL')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires du fichier :', error);
      return [];
    }
  }

  async createComment(commentData: any): Promise<any> {
    try {
      const comment = new CommentModel(commentData);
      await comment.save();

      // Mettre à jour la note moyenne du fichier si une note est donnée
      if (commentData.rating > 0) {
        const file = await FileModel.findById(commentData.fileId);
        if (file) {
          const totalRatings = file.totalRatings + 1;
          const newRating =
            (file.rating * file.totalRatings + commentData.rating) / totalRatings;
          await FileModel.findByIdAndUpdate(commentData.fileId, {
            rating: newRating,
            totalRatings,
          });
        }
      }

      return comment;
    } catch (error) {
      console.error('Erreur lors de la création du commentaire :', error);
      throw error;
    }
  }

  // Paiements
  async createPayment(paymentData: any): Promise<any> {
    try {
      const payment = new PaymentModel(paymentData);
      return await payment.save();
    } catch (error) {
      console.error('Erreur lors de la création du paiement :', error);
      throw error;
    }
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

      return await PaymentModel.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du paiement :', error);
      return undefined;
    }
  }

  async getUserPayments(userId: number): Promise<any[]> {
    try {
      return await PaymentModel.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements utilisateur :', error);
      return [];
    }
  }
}