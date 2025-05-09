import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Icons } from "@/assets/icons";
import { useLocation } from "wouter";

export default function CTA() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (user) {
      setLocation("/dashboard?upload=true");
    } else {
      setLocation("/auth");
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary/90 to-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-heading font-bold text-white mb-6">Prêt à transformer vos fichiers en revenus?</h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-8">
          Rejoignez des milliers de créateurs qui partagent leurs fichiers et gagnent 500F CFA à chaque téléchargement.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg"
            className="animate-float px-8 py-4 bg-white text-primary font-bold rounded-lg text-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
            onClick={handleGetStarted}
          >
            <Icons.upload className="mr-2" />
            Commencer maintenant
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="px-8 py-4 bg-transparent text-white border-2 border-white font-bold rounded-lg text-lg hover:bg-white/10 transition-colors"
            onClick={() => setLocation("/#comment-ca-marche")}
          >
            <Icons.info className="mr-2" />
            En savoir plus
          </Button>
        </div>
      </div>
    </section>
  );
}
