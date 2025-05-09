import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Features() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleUploadClick = () => {
    if (user) {
      setLocation("/dashboard?upload=true");
    } else {
      setLocation("/auth");
    }
  };

  return (
    <section id="comment-ca-marche" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold">Comment ça marche ?</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            FaviSend est la façon la plus simple de monétiser le partage de vos fichiers, en seulement 3 étapes simples.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary font-heading font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Uploadez votre fichier</h3>
            <p className="text-gray-600">
              Téléchargez n'importe quel fichier (PDF, MP3, MP4, ZIP...) jusqu'à 100MB.
            </p>
            <div className="mt-4 flex items-center text-sm text-primary font-medium">
              <Icons.upload className="mr-2" />
              <span>Simple et sécurisé</span>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-green-50 p-6 rounded-xl">
            <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-secondary font-heading font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Partagez votre lien</h3>
            <p className="text-gray-600">
              Obtenez un lien unique à partager sur les réseaux sociaux ou par message.
            </p>
            <div className="mt-4 flex items-center text-sm text-secondary font-medium">
              <Icons.link className="mr-2" />
              <span>Diffusion illimitée</span>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-amber-50 p-6 rounded-xl">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-accent font-heading font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Gagnez 500F par téléchargement</h3>
            <p className="text-gray-600">
              À chaque téléchargement, vous recevez 450F CFA directement sur votre compte.
            </p>
            <div className="mt-4 flex items-center text-sm text-accent font-medium">
              <Icons.money className="mr-2" />
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:w-2/3">
              <h3 className="text-xl font-heading font-semibold">Prêt à commencer ?</h3>
              <p className="mt-2 text-gray-600">
                Rejoignez des milliers de créateurs qui monétisent déjà leurs contenus sur FaviSend.
              </p>
            </div>
            <div>
              <Button 
                className="px-6 py-3 bg-primary text-white font-medium rounded-lg text-lg shadow-md hover:bg-primary/90 transition-colors"
                onClick={handleUploadClick}
              >
                <Icons.upload className="mr-2" />
                Uploader maintenant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
