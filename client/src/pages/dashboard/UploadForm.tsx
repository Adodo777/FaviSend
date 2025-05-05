import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "video/mp4",
  "video/mpeg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const uploadFormSchema = z.object({
  title: z.string().min(3, {
    message: "Le titre doit contenir au moins 3 caractères.",
  }),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface UploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UploadForm({ onSuccess, onCancel }: UploadFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", "/api/files", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/user"] });
      toast({
        title: "Fichier partagé avec succès",
        description: "Votre fichier est maintenant disponible pour le téléchargement.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur s'est produite lors de l'enregistrement du fichier: ${error}`,
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`Le fichier est trop volumineux. La taille maximale est de 100MB.`);
      setFile(null);
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      setFileError(`Type de fichier non accepté. Les formats acceptés sont: PDF, ZIP, RAR, MP3, MP4, etc.`);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setFileError(null);
    
    const droppedFile = e.dataTransfer.files[0];
    
    if (!droppedFile) {
      return;
    }
    
    // Validate file size
    if (droppedFile.size > MAX_FILE_SIZE) {
      setFileError(`Le fichier est trop volumineux. La taille maximale est de 100MB.`);
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(droppedFile.type)) {
      setFileError(`Type de fichier non accepté. Les formats acceptés sont: PDF, ZIP, RAR, MP3, MP4, etc.`);
      return;
    }
    
    setFile(droppedFile);
  };

  const uploadFileToFirebase = async () => {
    if (!file || !user) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a reference to the file in Firebase Storage
    const fileExtension = file.name.split('.').pop();
    const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`);
    
    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setIsUploading(false);
          reject(error);
        },
        async () => {
          // Upload completed successfully, get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setIsUploading(false);
          resolve(downloadURL);
        }
      );
    });
  };

  const onSubmit = async (values: UploadFormValues) => {
    if (!file || !user) {
      setFileError("Veuillez sélectionner un fichier à uploader.");
      return;
    }
    
    try {
      // First upload the file to Firebase Storage
      const downloadURL = await uploadFileToFirebase();
      
      if (!downloadURL) {
        throw new Error("Erreur lors de l'upload du fichier.");
      }
      
      // Then save the file metadata to our database
      const fileData = {
        title: values.title,
        description: values.description || "",
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloadUrl: downloadURL,
      };
      
      saveMutation.mutate(fileData);
    } catch (error) {
      console.error("Error during file upload:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: "Une erreur s'est produite lors de l'upload du fichier.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Uploader un nouveau fichier</CardTitle>
        <CardDescription>
          Partagez vos fichiers et gagnez 450F CFA par téléchargement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du fichier</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Guide complet du Marketing Digital" 
                      {...field} 
                      disabled={isUploading || saveMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnelle)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre fichier..." 
                      {...field} 
                      rows={3}
                      disabled={isUploading || saveMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optionnels, séparés par des virgules)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: marketing, digital, guide" 
                      {...field} 
                      disabled={isUploading || saveMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block mb-1">Fichier</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading || saveMutation.isPending}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 ${
                  fileError ? "border-red-500" : file ? "border-green-500" : "border-gray-200"
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <Icons.check className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB - {file.type}
                    </p>
                  </div>
                ) : (
                  <>
                    <Icons.upload className="mx-auto text-3xl text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Cliquez pour uploader ou glissez votre fichier ici
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      PDF, MP3, MP4, ZIP, etc. (Max. 100MB)
                    </p>
                  </>
                )}
              </div>
              {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Upload en cours...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} max={100} />
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancel}
                  disabled={isUploading || saveMutation.isPending}
                >
                  Annuler
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={!file || isUploading || saveMutation.isPending}
              >
                {isUploading ? (
                  <>
                    <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : saveMutation.isPending ? (
                  <>
                    <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Icons.send className="mr-2 h-4 w-4" />
                    Obtenir mon lien de partage
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
