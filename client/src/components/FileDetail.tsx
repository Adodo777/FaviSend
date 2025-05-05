import { useState } from "react";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileDetailType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface FileDetailProps {
  file: FileDetailType;
  onDownload: () => void;
  isDownloading: boolean;
}

export default function FileDetail({ file, onDownload, isDownloading }: FileDetailProps) {
  const [copied, setCopied] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <Icons.filePdf className="text-red-600 h-12 w-12" />;
    if (fileType.includes('image')) return <Icons.fileImage className="text-blue-600 h-12 w-12" />;
    if (fileType.includes('audio')) return <Icons.fileAudio className="text-blue-600 h-12 w-12" />;
    if (fileType.includes('video')) return <Icons.fileVideo className="text-red-600 h-12 w-12" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) 
      return <Icons.fileArchive className="text-amber-600 h-12 w-12" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) 
      return <Icons.fileSpreadsheet className="text-green-600 h-12 w-12" />;
    if (fileType.includes('word') || fileType.includes('document')) 
      return <Icons.fileText className="text-blue-600 h-12 w-12" />;
    return <Icons.file className="text-gray-500 h-12 w-12" />;
  };

  const getBgColorClass = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-50';
    if (fileType.includes('image')) return 'bg-blue-50';
    if (fileType.includes('audio')) return 'bg-blue-50';
    if (fileType.includes('video')) return 'bg-red-50';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) 
      return 'bg-amber-50';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) 
      return 'bg-green-50';
    if (fileType.includes('word') || fileType.includes('document')) 
      return 'bg-blue-50';
    return 'bg-gray-50';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extension = file.fileName.split('.').pop()?.toUpperCase() || 'FILE';

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/file/${file.shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* File icon and info */}
          <div className={`${getBgColorClass(file.fileType)} p-8 rounded-xl flex items-center justify-center`}>
            {getFileIcon(file.fileType)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-2xl font-heading font-bold">{file.title}</h1>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {extension}
              </Badge>
            </div>
            
            {/* User info */}
            <div className="flex items-center mt-2 mb-4">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={file.user?.photoURL || undefined} alt={file.user?.displayName || "Utilisateur"} />
                <AvatarFallback>{file.user?.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                Uploadé par <span className="font-medium">{file.user?.displayName || "Utilisateur anonyme"}</span>
                {" • "}
                {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true, locale: fr })}
              </span>
            </div>
            
            {/* Description */}
            {file.description && (
              <p className="text-gray-700 mb-4">{file.description}</p>
            )}
            
            {/* File metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Taille du fichier</p>
                <p className="font-medium">{formatFileSize(file.fileSize)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Téléchargements</p>
                <p className="font-medium">{file.downloads}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Note moyenne</p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icons.starFill
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(file.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{file.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total des commentaires</p>
                <p className="font-medium">{file.comments?.length || 0}</p>
              </div>
            </div>
            
            {/* Tags */}
            {file.tags && file.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {file.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                className="flex-1"
                size="lg"
                onClick={onDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Icons.loader className="mr-2 h-5 w-5 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Icons.download className="mr-2 h-5 w-5" />
                    Télécharger pour 500F CFA
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={copyShareLink}
              >
                {copied ? (
                  <>
                    <Icons.check className="mr-2 h-5 w-5 text-green-500" />
                    Lien copié!
                  </>
                ) : (
                  <>
                    <Icons.copy className="mr-2 h-5 w-5" />
                    Copier le lien
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
