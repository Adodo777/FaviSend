import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/assets/icons";
import { useQuery } from "@tanstack/react-query";
import FileCard from "@/components/FileCard";
import { FileWithUser } from "@/types";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterType = "popular" | "recent" | "topRated";

export default function Explore() {
  const [filter, setFilter] = useState<FilterType>("popular");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: files, isLoading } = useQuery<FileWithUser[]>({
    queryKey: [`/api/files?filter=${filter}`],
  });

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const filteredFiles = files?.filter(file => 
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Explorez les fichiers</h1>
            <p className="text-gray-600">Découvrez des fichiers populaires, récents et bien notés</p>
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Input
              placeholder="Rechercher des fichiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>

        <Tabs defaultValue={filter} onValueChange={(value) => handleFilterChange(value as FilterType)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="popular" className="flex items-center justify-center">
              <Icons.fire className="mr-2 h-4 w-4 text-accent" />
              Populaires
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center justify-center">
              <Icons.time className="mr-2 h-4 w-4 text-primary" />
              Récents
            </TabsTrigger>
            <TabsTrigger value="topRated" className="flex items-center justify-center">
              <Icons.star className="mr-2 h-4 w-4 text-secondary" />
              Mieux notés
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 p-5 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="ml-3">
                      <div className="h-5 w-40 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="h-5 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !filteredFiles || filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-3">
            <div className="rounded-full bg-gray-100 p-4">
              <Icons.search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">Aucun fichier trouvé</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {searchTerm 
                ? `Aucun résultat pour "${searchTerm}". Essayez avec d'autres termes.` 
                : "Aucun fichier n'est disponible dans cette catégorie pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
