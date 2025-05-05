import { Link } from "wouter";
import { Icons } from "@/assets/icons";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <Icons.logo className="text-primary text-2xl mr-2" />
              <span className="font-heading font-bold text-xl">FaviSend</span>
            </div>
            <p className="text-gray-400 mb-4">
              La plateforme de partage de fichiers qui vous rémunère à chaque téléchargement.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Icons.facebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Icons.twitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Icons.instagram className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Icons.linkedin className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/explore" className="text-gray-400 hover:text-white transition-colors">Explorer</Link></li>
              <li><Link href="/#comment-ca-marche" className="text-gray-400 hover:text-white transition-colors">Comment ça marche</Link></li>
              <li><Link href="/#testimonials" className="text-gray-400 hover:text-white transition-colors">Témoignages</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Signaler un problème</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Conditions d'utilisation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} FaviSend. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
