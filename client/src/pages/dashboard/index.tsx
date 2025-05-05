import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/assets/icons";
import UploadForm from "@/components/UploadForm";
import FilesList from "./FilesList";
import Stats from "./Stats";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("files");
  const search = useSearch();
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    // Check if user is not authenticated and not loading
    if (!isLoading && !user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder au tableau de bord",
        variant: "destructive",
      });
      setLocation("/");
    }

    // Check for upload=true query parameter to show the upload form
    if (search.includes("upload=true")) {
      setShowUploadModal(true);
    }
  }, [isLoading, user, setLocation, search, toast]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setActiveTab("files");
    toast({
      title: "Fichier uploadé avec succès",
      description: "Votre fichier est maintenant disponible pour le partage!",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Icons.loader className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Gérez vos fichiers et suivez vos gains</p>
          </div>
          <button 
            className="mt-4 md:mt-0 px-4 py-2 bg-primary text-white rounded-lg flex items-center hover:bg-primary/90 transition-colors"
            onClick={() => setShowUploadModal(true)}
          >
            <Icons.upload className="mr-2" />
            Uploader un fichier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenus totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0 FCFA</div>
              <p className="text-xs text-muted-foreground mt-1">
                +0% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Téléchargements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Sur l'ensemble de vos fichiers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fichiers uploadés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Vous pouvez uploader plus de fichiers
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="files" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="files" className="flex items-center">
              <Icons.files className="mr-2 h-4 w-4" />
              Mes fichiers
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <Icons.barChart className="mr-2 h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <Icons.wallet className="mr-2 h-4 w-4" />
              Paiements
            </TabsTrigger>
          </TabsList>
          <TabsContent value="files" className="space-y-4">
            <FilesList />
          </TabsContent>
          <TabsContent value="stats" className="space-y-4">
            <Stats />
          </TabsContent>
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paiements</CardTitle>
                <CardDescription>
                  Historique de vos paiements et factures
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="rounded-full bg-gray-100 p-4">
                    <Icons.wallet className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun paiement</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Vous n'avez pas encore reçu de paiement. Les paiements sont effectués automatiquement une fois que vous atteignez 5000 FCFA.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-medium">Uploader un fichier</h3>
                <button onClick={() => setShowUploadModal(false)}>
                  <Icons.x className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <div className="p-4">
                <UploadForm onSuccess={handleUploadSuccess} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
