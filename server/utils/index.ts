import crypto from 'crypto';

/**
 * Generate a unique ID for sharing URLs
 * @returns A unique string ID
 */
export const generateUniqueId = (length: number = 10): string => {
  // Create a Base64 encoded string
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
};

/**
 * Format file size to human readable format
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type icon based on MIME type
 * @param mimeType The MIME type
 * @returns Icon identifier
 */
export const getFileTypeIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) 
    return 'archive';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) 
    return 'spreadsheet';
  if (mimeType.includes('word') || mimeType.includes('document')) 
    return 'document';
  
  return 'file';
};

/**
 * Validate email address format
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Extract file extension from filename
 * @param filename The filename
 * @returns File extension (e.g., "pdf")
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Sanitize a string for safe use in URLs or file names
 * @param str String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
};
