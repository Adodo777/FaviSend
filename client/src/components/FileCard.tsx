import { Link } from "wouter";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { FileWithUser } from "@/types";

type FileCardProps = {
  file: FileWithUser;
};

export default function FileCard({ file }: FileCardProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <Icons.filePdf className="text-red-600" />;
    if (fileType.includes('image')) return <Icons.fileImage className="text-blue-600" />;
    if (fileType.includes('audio')) return <Icons.fileAudio className="text-blue-600" />;
    if (fileType.includes('video')) return <Icons.fileVideo className="text-red-600" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) 
      return <Icons.fileArchive className="text-amber-600" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) 
      return <Icons.fileSpreadsheet className="text-green-600" />;
    if (fileType.includes('word') || fileType.includes('document')) 
      return <Icons.fileText className="text-blue-600" />;
    return <Icons.file />;
  };

  const getBgColorClass = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-100';
    if (fileType.includes('image')) return 'bg-blue-100';
    if (fileType.includes('audio')) return 'bg-blue-100';
    if (fileType.includes('video')) return 'bg-red-100';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) 
      return 'bg-amber-100';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) 
      return 'bg-green-100';
    if (fileType.includes('word') || fileType.includes('document')) 
      return 'bg-blue-100';
    return 'bg-purple-100';
  };

  const getTextColorClass = (fileType: string) => {
    if (fileType.includes('pdf')) return 'text-red-800';
    if (fileType.includes('image')) return 'text-blue-800';
    if (fileType.includes('audio')) return 'text-blue-800';
    if (fileType.includes('video')) return 'text-red-800';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) 
      return 'text-amber-800';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) 
      return 'text-green-800';
    if (fileType.includes('word') || fileType.includes('document')) 
      return 'text-blue-800';
    return 'text-purple-800';
  };

  const extension = file.fileName.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${getBgColorClass(file.fileType)} flex items-center justify-center mr-3`}>
              {getFileIcon(file.fileType)}
            </div>
            <div>
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {file.title}
              </h3>
              <p className="text-xs text-gray-500">
                Par {file.user?.displayName || "Utilisateur anonyme"}
              </p>
            </div>
          </div>
          <div className={`${getBgColorClass(file.fileType)} ${getTextColorClass(file.fileType)} text-xs font-medium px-2 py-1 rounded-full`}>
            {extension}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {file.description || "Aucune description fournie."}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {file.tags?.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
          {(!file.tags || file.tags.length === 0) && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {extension.toLowerCase()}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            <Icons.download className="text-gray-400 mr-1" />
            <span className="text-gray-500">{file.downloads} téléchargements</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <Icons.starFill className="text-yellow-400 mr-1" />
              <span className="text-sm text-gray-600">{file.rating.toFixed(1)}</span>
            </div>
            <Link href={`/file/${file.shareUrl}`}>
              <Button size="sm" className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <Icons.download className="mr-1" />
                500F
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
