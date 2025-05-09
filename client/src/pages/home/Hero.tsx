import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import UploadForm from "@/components/UploadForm";

export default function Hero() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleUploadClick = () => {
    if (user) {
      setShowUploadForm(true);
    } else {
      // Redirige vers la page d'authentification au lieu d'utiliser Google
      setLocation("/auth");
    }
  };

  return (
    <section className="pt-20 md:pt-32 pb-16 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark leading-tight">
              <span className="text-primary">Partagez</span> vos fichiers,
              <span className="text-primary"> Gagnez</span> de l'argent
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Obtenez <span className="font-semibold text-primary">500F CFA</span> à chaque fois que quelqu'un télécharge votre fichier. Simple, rapide et sans compromis.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="animate-float flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary/90 transition-all duration-300"
                onClick={handleUploadClick}
              >
                <Icons.upload className="mr-2" />
                Uploader un fichier
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-6 py-3 bg-white text-primary border-2 border-primary font-medium rounded-lg text-lg hover:bg-purple-50 transition-colors"
                onClick={() => setLocation("/explore")}
              >
                <Icons.compass className="mr-2" />
                Explorer
              </Button>
            </div>
            <div className="mt-6 flex items-center text-sm text-gray-500">
              <Icons.shield className="text-secondary mr-2" />
              <span>Déjà <span className="font-semibold">24,580+</span> téléchargements sécurisés</span>
            </div>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -left-4 -top-4 w-64 h-64 bg-primary/10 rounded-full filter blur-xl animate-pulse"></div>
              <div className="absolute -right-4 -bottom-4 w-64 h-64 bg-secondary/10 rounded-full filter blur-xl animate-pulse delay-1000"></div>
              
              {showUploadForm ? (
                <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                  <UploadForm onSuccess={() => setLocation("/dashboard")} />
                </div>
              ) : (
                <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icons.fileList className="text-primary" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Commencez maintenant</h3>
                      <p className="text-xs text-gray-500">En quelques secondes</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 text-gray-700">Titre du fichier</label>
                      <input 
                        type="text" 
                        placeholder="Cours complet de Marketing Digital" 
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        onClick={handleUploadClick}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 text-gray-700">Description (optionnelle)</label>
                      <textarea 
                        placeholder="Une description de votre fichier..." 
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none" 
                        rows={2}
                        onClick={handleUploadClick}
                      ></textarea>
                    </div>
                    <div 
                      className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50"
                      onClick={handleUploadClick}
                    >
                      <Icons.upload className="mx-auto text-3xl text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Cliquez pour uploader ou glissez votre fichier ici</p>
                      <p className="mt-1 text-xs text-gray-400">PDF, MP3, MP4, ZIP (Max. 100MB)</p>
                    </div>
                    <Button 
                      className="w-full py-3 bg-primary text-white font-medium rounded-lg shadow-md hover:bg-primary/90 transition-colors"
                      onClick={handleUploadClick}
                    >
                      <Icons.send className="mr-2" />
                      Obtenir mon lien de partage
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
