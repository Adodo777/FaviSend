import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileType } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function FilesList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copyingId, setCopyingId] = useState<number | null>(null);

  const { data: files, isLoading } = useQuery<FileType[]>({
    queryKey: ["/api/files/user"],
    enabled: !!user?.uid,
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) => 
      apiRequest("DELETE", `/api/files/${fileId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/user"] });
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de supprimer le fichier: ${error}`,
      });
    }
  });

  const copyToClipboard = async (fileId: number, shareUrl: string) => {
    setCopyingId(fileId);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/file/${shareUrl}`);
      toast({
        title: "Lien copié!",
        description: "Le lien a été copié dans votre presse-papier.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le lien.",
      });
    } finally {
      setTimeout(() => setCopyingId(null), 2000);
    }
  };

  const handleDeleteFile = (fileId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier?")) {
      deleteFileMutation.mutate(fileId);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <Icons.filePdf className="text-red-500" />;
    if (fileType.includes('image')) return <Icons.fileImage className="text-blue-500" />;
    if (fileType.includes('audio')) return <Icons.fileAudio className="text-green-500" />;
    if (fileType.includes('video')) return <Icons.fileVideo className="text-purple-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) 
      return <Icons.fileArchive className="text-amber-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) 
      return <Icons.fileSpreadsheet className="text-green-600" />;
    if (fileType.includes('word') || fileType.includes('document')) 
      return <Icons.fileText className="text-blue-600" />;
    return <Icons.file className="text-gray-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-10">
            <Icons.loader className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!files || files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="rounded-full bg-gray-100 p-4">
              <Icons.fileX className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">Aucun fichier</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Vous n'avez pas encore uploadé de fichier. Commencez par uploader votre premier fichier.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fichier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Téléchargements</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden lg:table-cell">Revenus</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file.fileType)}
                    <span className="truncate max-w-[180px]">{file.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-xs">
                    {file.fileType.split('/')[1] || 'fichier'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{file.downloads}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {file.createdAt ? formatDistanceToNow(new Date(file.createdAt), { 
                    addSuffix: true, 
                    locale: fr 
                  }) : '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{file.downloads * 450} FCFA</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(file.id, file.shareUrl)}
                    >
                      {copyingId === file.id ? (
                        <Icons.check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Icons.copy className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icons.moreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/file/${file.shareUrl}`, '_blank')}>
                          <Icons.externalLink className="mr-2 h-4 w-4" />
                          Voir la page
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Icons.trash className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
