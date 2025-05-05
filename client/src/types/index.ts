// User types
export interface User {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  balance: number;
}

export interface UserBasic {
  id: number;
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

// File types
export interface FileType {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  shareUrl: string;
  tags: string[];
  downloads: number;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileWithUser extends FileType {
  user: UserBasic;
}

export interface FileDetailType extends FileType {
  user: UserBasic;
  comments: CommentType[];
}

// Comment types
export interface CommentType {
  id: number;
  fileId: number;
  userId: number;
  comment: string;
  rating: number;
  createdAt: string;
  user: UserBasic;
}

// Download types
export interface DownloadType {
  id: number;
  fileId: number;
  userId: number | null;
  ipAddress: string;
  userAgent: string;
  earnings: number;
  createdAt: string;
}

// Payment types
export interface PaymentType {
  id: number;
  userId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId: string | null;
  details: any;
  createdAt: string;
  completedAt: string | null;
}

// Stats types
export interface UserStats {
  totalFiles: number;
  totalDownloads: number;
  totalEarnings: number;
}

// Upload types
export interface UploadFormData {
  title: string;
  description?: string;
  tags?: string[];
  file: File;
}
