import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileDetailType, CommentType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import FileDetail from "@/components/FileDetail";

export default function File() {
  const [, params] = useRoute<{ id: string }>("/file/:id");
  const [, setLocation] = useLocation();
  const { user, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const fileId = params?.id;

  const { data: fileData, isLoading, error } = useQuery<FileDetailType>({
    queryKey: [`/api/files/detail/${fileId}`],
    enabled: !!fileId,
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Ce fichier n'existe pas ou a été supprimé.",
      });
      setLocation("/explore");
    }
  }, [error, toast, setLocation]);

  const downloadMutation = useMutation({
    mutationFn: (fileShareUrl: string) => 
      apiRequest("POST", `/api/files/download/${fileShareUrl}`),
    onSuccess: (response) => {
      response.json().then(data => {
        // Redirect to actual file URL for download
        window.open(data.downloadUrl, "_blank");
        queryClient.invalidateQueries({ queryKey: [`/api/files/detail/${fileId}`] });
        toast({
          title: "Téléchargement démarré",
          description: "Votre fichier commence à se télécharger.",
        });
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de télécharger le fichier: ${error}`,
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: (data: { fileId: number; comment: string; rating: number }) => 
      apiRequest("POST", `/api/files/comment`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/files/detail/${fileId}`] });
      setComment("");
      setRating(0);
      toast({
        title: "Commentaire publié",
        description: "Votre commentaire a été publié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de publier le commentaire: ${error}`,
      });
    }
  });

  const handleDownload = () => {
    if (!fileData) return;
    
    if (user) {
      downloadMutation.mutate(fileData.shareUrl);
    } else {
      // Prompt for login before download
      const shouldLogin = window.confirm("Vous devez être connecté pour télécharger ce fichier. Voulez-vous vous connecter maintenant?");
      if (shouldLogin) {
        signInWithGoogle();
      }
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData || !comment.trim() || rating === 0) return;
    
    if (user) {
      commentMutation.mutate({
        fileId: fileData.id,
        comment: comment.trim(),
        rating
      });
    } else {
      // Prompt for login before commenting
      const shouldLogin = window.confirm("Vous devez être connecté pour laisser un commentaire. Voulez-vous vous connecter maintenant?");
      if (shouldLogin) {
        signInWithGoogle();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin">
          <Icons.loader className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/explore")}
            className="mb-4"
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" /> Retour à l'exploration
          </Button>
          
          <FileDetail file={fileData} onDownload={handleDownload} isDownloading={downloadMutation.isPending} />
        </div>

        {/* Comments section */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-semibold mb-6">Commentaires et avis</h2>
          
          {/* Comment form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <p className="text-sm font-medium mr-3">Votre note :</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          {(hoverRating || rating) >= star ? (
                            <Icons.starFill className="h-6 w-6 text-yellow-400" />
                          ) : (
                            <Icons.star className="h-6 w-6 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Partagez votre avis sur ce fichier..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!comment.trim() || rating === 0 || commentMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {commentMutation.isPending ? (
                    <>
                      <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                      Publication en cours...
                    </>
                  ) : (
                    <>
                      <Icons.send className="mr-2 h-4 w-4" />
                      Publier un commentaire
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Comments list */}
          {fileData.comments && fileData.comments.length > 0 ? (
            <div className="space-y-4">
              {fileData.comments.map((comment: CommentType) => (
                <Card key={comment.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={comment.user.photoURL || undefined} alt={comment.user.displayName} />
                        <AvatarFallback>{comment.user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{comment.user.displayName}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        <div className="flex mt-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icons.starFill 
                              key={i} 
                              className={`h-4 w-4 ${i < comment.rating ? 'text-yellow-400' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm">{comment.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Icons.messageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Aucun commentaire</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Soyez le premier à laisser votre avis sur ce fichier!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
