import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Icons } from "@/assets/icons";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Icons.logo className="text-primary text-2xl mr-2" />
              <span className="font-heading font-bold text-xl">FaviSend</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/explore" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Explorer
            </Link>
            <Link href="/#comment-ca-marche" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Comment ça marche
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback>{(user.displayName || "User").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href="/dashboard">Tableau de bord</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                <Button 
                  variant="outline" 
                  className="px-4 py-2 rounded-md bg-white text-primary border border-primary font-medium text-sm hover:bg-primary/5 transition-colors"
                >
                  Se connecter
                </Button>
              </Link>
                
              <Link href="/auth">
                <Button
                  className="px-4 py-2 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  S'inscrire
                </Button>
              </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icons.menu className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
            Explorer
          </Link>
          <Link href="/#comment-ca-marche" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
            Comment ça marche
          </Link>
          
          {user ? (
            <>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                Tableau de bord
              </Link>
              <Button
                variant="outline"
                className="w-full mt-2 px-4 py-2 rounded-md text-primary border border-primary font-medium text-sm hover:bg-primary/5 transition-colors"
                onClick={() => signOut()}
              >
                Se déconnecter
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth" className="w-full">
                <Button
                  variant="outline"
                  className="w-full mt-2 px-4 py-2 rounded-md text-primary border border-primary font-medium text-sm hover:bg-primary/5 transition-colors"
                >
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth" className="w-full">
                <Button
                  className="w-full mt-2 px-4 py-2 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
