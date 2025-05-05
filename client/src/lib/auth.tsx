import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "./queryClient";

// Définition du type utilisateur
interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Vérifie si l'utilisateur est connecté au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important pour envoyer les cookies de session
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification:", err);
        setUser(null);
        setError(err instanceof Error ? err : new Error("Erreur d'authentification inconnue"));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la connexion");
      }
      
      const userData = await response.json();
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Connecté avec succès",
        description: "Bienvenue sur FaviSend!",
      });
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err instanceof Error ? err : new Error("Erreur de connexion inconnue"));
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: err instanceof Error ? err.message : "Vérifiez vos identifiants et réessayez.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/register", {
        username,
        email,
        password,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'inscription");
      }
      
      const userData = await response.json();
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Compte créé avec succès",
        description: "Bienvenue sur FaviSend!",
      });
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(err instanceof Error ? err : new Error("Erreur d'inscription inconnue"));
      toast({
        variant: "destructive",
        title: "Échec de l'inscription",
        description: err instanceof Error ? err.message : "Cet identifiant ou email est peut-être déjà utilisé.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/logout");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la déconnexion");
      }
      
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Déconnecté avec succès",
        description: "À bientôt!",
      });
    } catch (err) {
      console.error("Erreur de déconnexion:", err);
      setError(err instanceof Error ? err : new Error("Erreur de déconnexion inconnue"));
      toast({
        variant: "destructive",
        title: "Échec de la déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};