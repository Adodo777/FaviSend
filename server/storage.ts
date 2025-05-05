import { 
  User, InsertUser, 
  File, InsertFile,
  Download, InsertDownload,
  Comment, InsertComment,
  Payment, InsertPayment,
  users, files, downloads, comments, payments
} from "@shared/schema";
import { generateUniqueId } from "./utils";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<User | undefined>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFileByShareUrl(shareUrl: string): Promise<File | undefined>;
  getUserFiles(userId: number): Promise<File[]>;
  createFile(file: InsertFile, userId: number): Promise<File>;
  updateFile(id: number, data: Partial<File>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // File listing operations
  getPopularFiles(limit?: number): Promise<File[]>;
  getRecentFiles(limit?: number): Promise<File[]>;
  getTopRatedFiles(limit?: number): Promise<File[]>;
  
  // Download operations
  recordDownload(download: InsertDownload): Promise<Download>;
  getFileDownloads(fileId: number): Promise<Download[]>;
  getUserDownloads(userId: number): Promise<Download[]>;
  
  // Comment operations
  getFileComments(fileId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined>;
  getUserPayments(userId: number): Promise<Payment[]>;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private filesStore: Map<number, File>;
  private downloadsStore: Map<number, Download>;
  private commentsStore: Map<number, Comment>;
  private paymentsStore: Map<number, Payment>;
  private userId: number;
  private fileId: number;
  private downloadId: number;
  private commentId: number;
  private paymentId: number;

  constructor() {
    this.usersStore = new Map();
    this.filesStore = new Map();
    this.downloadsStore = new Map();
    this.commentsStore = new Map();
    this.paymentsStore = new Map();
    this.userId = 1;
    this.fileId = 1;
    this.downloadId = 1;
    this.commentId = 1;
    this.paymentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(user => user.uid === uid);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt: now, 
      updatedAt: now,
      balance: 0
    };
    this.usersStore.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      balance: user.balance + amount,
      updatedAt: new Date()
    };
    this.usersStore.set(userId, updatedUser);
    return updatedUser;
  }

  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.filesStore.get(id);
  }

  async getFileByShareUrl(shareUrl: string): Promise<File | undefined> {
    return Array.from(this.filesStore.values()).find(file => file.shareUrl === shareUrl);
  }

  async getUserFiles(userId: number): Promise<File[]> {
    return Array.from(this.filesStore.values())
      .filter(file => file.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createFile(fileData: InsertFile, userId: number): Promise<File> {
    const id = this.fileId++;
    const now = new Date();
    // Generate a unique shareUrl
    const shareUrl = generateUniqueId();
    
    const file: File = {
      ...fileData,
      id,
      userId,
      shareUrl,
      downloads: 0,
      rating: 0,
      totalRatings: 0,
      createdAt: now,
      updatedAt: now
    };
    this.filesStore.set(id, file);
    return file;
  }

  async updateFile(id: number, data: Partial<File>): Promise<File | undefined> {
    const file = await this.getFile(id);
    if (!file) return undefined;

    const updatedFile: File = {
      ...file,
      ...data,
      updatedAt: new Date()
    };
    this.filesStore.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.filesStore.delete(id);
  }

  // File listing operations
  async getPopularFiles(limit: number = 10): Promise<File[]> {
    return Array.from(this.filesStore.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  async getRecentFiles(limit: number = 10): Promise<File[]> {
    return Array.from(this.filesStore.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getTopRatedFiles(limit: number = 10): Promise<File[]> {
    return Array.from(this.filesStore.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Download operations
  async recordDownload(downloadData: InsertDownload): Promise<Download> {
    const id = this.downloadId++;
    const now = new Date();
    
    const download: Download = {
      ...downloadData,
      id,
      createdAt: now
    };
    this.downloadsStore.set(id, download);
    
    // Update file download count
    const file = await this.getFile(downloadData.fileId);
    if (file) {
      await this.updateFile(file.id, { downloads: file.downloads + 1 });
      
      // Update user balance if file has an owner
      const user = await this.getUser(file.userId);
      if (user) {
        await this.updateUserBalance(user.id, 450); // 450F CFA per download
      }
    }
    
    return download;
  }

  async getFileDownloads(fileId: number): Promise<Download[]> {
    return Array.from(this.downloadsStore.values())
      .filter(download => download.fileId === fileId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserDownloads(userId: number): Promise<Download[]> {
    // Get all files by user
    const userFiles = await this.getUserFiles(userId);
    const fileIds = userFiles.map(file => file.id);
    
    // Get downloads for these files
    return Array.from(this.downloadsStore.values())
      .filter(download => fileIds.includes(download.fileId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Comment operations
  async getFileComments(fileId: number): Promise<Comment[]> {
    return Array.from(this.commentsStore.values())
      .filter(comment => comment.fileId === fileId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    
    const comment: Comment = {
      ...commentData,
      id,
      createdAt: now
    };
    this.commentsStore.set(id, comment);
    
    // Update file rating
    const file = await this.getFile(commentData.fileId);
    if (file) {
      const totalRating = file.rating * file.totalRatings + commentData.rating;
      const newTotalRatings = file.totalRatings + 1;
      const newRating = totalRating / newTotalRatings;
      
      await this.updateFile(file.id, { 
        rating: newRating,
        totalRatings: newTotalRatings
      });
    }
    
    return comment;
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const now = new Date();
    
    const payment: Payment = {
      ...paymentData,
      id,
      status: 'pending',
      createdAt: now,
      completedAt: null
    };
    this.paymentsStore.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined> {
    const payment = this.paymentsStore.get(id);
    if (!payment) return undefined;
    
    const updatedPayment: Payment = {
      ...payment,
      status,
      transactionId: transactionId || payment.transactionId,
      completedAt: status === 'completed' ? new Date() : payment.completedAt
    };
    this.paymentsStore.set(id, updatedPayment);
    
    // If payment is completed, update user balance
    if (status === 'completed') {
      await this.updateUserBalance(payment.userId, -payment.amount); // Subtract the withdrawn amount
    }
    
    return updatedPayment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return Array.from(this.paymentsStore.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Export an instance of MemStorage
export const storage = new MemStorage();
