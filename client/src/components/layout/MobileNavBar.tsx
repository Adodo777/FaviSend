import { Link, useLocation } from "wouter";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function MobileNavBar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around z-40">
      <Link href="/">
        <div className={`flex flex-col items-center ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
          <Icons.home className="text-xl" />
          <span className="text-xs">Accueil</span>
        </div>
      </Link>
      
      <Link href="/explore">
        <div className={`flex flex-col items-center ${location === '/explore' ? 'text-primary' : 'text-gray-500'}`}>
          <Icons.compass className="text-xl" />
          <span className="text-xs">Explorer</span>
        </div>
      </Link>
      
      <Link href={user ? "/dashboard?upload=true" : "/dashboard"}>
        <Button className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center -mt-4 shadow-lg">
          <Icons.upload className="text-xl" />
        </Button>
      </Link>
      
      <Link href="/dashboard">
        <div className={`flex flex-col items-center ${location === '/dashboard' ? 'text-primary' : 'text-gray-500'}`}>
          <Icons.download className="text-xl" />
          <span className="text-xs">Mes fichiers</span>
        </div>
      </Link>
      
      {user ? (
        <Link href="/dashboard">
          <div className={`flex flex-col items-center ${location === '/profile' ? 'text-primary' : 'text-gray-500'}`}>
            <Icons.user className="text-xl" />
            <span className="text-xs">Profil</span>
          </div>
        </Link>
      ) : (
        <Link href="/dashboard">
          <div className="flex flex-col items-center text-gray-500">
            <Icons.user className="text-xl" />
            <span className="text-xs">Connexion</span>
          </div>
        </Link>
      )}
    </div>
  );
}
