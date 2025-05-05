import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/assets/icons";
import { useQuery } from "@tanstack/react-query";
import FileCard from "@/components/FileCard";
import { FileWithUser } from "@/types";

type FilterType = "popular" | "recent" | "topRated";

export default function Explore() {
  const [filter, setFilter] = useState<FilterType>("popular");

  const { data: files, isLoading } = useQuery<FileWithUser[]>({
    queryKey: [`/api/files?filter=${filter}&limit=6`],
  });

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  return (
    <section id="explorer" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-heading font-bold">Explorez les fichiers populaires</h2>
          <div className="hidden md:block">
            <Button 
              variant={filter === "popular" ? "secondary" : "outline"} 
              className="mr-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={() => handleFilterChange("popular")}
            >
              <Icons.fire className="mr-1 text-accent" />
              Populaires
            </Button>
            <Button 
              variant={filter === "recent" ? "secondary" : "outline"} 
              className="mr-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={() => handleFilterChange("recent")}
            >
              <Icons.time className="mr-1 text-primary" />
              Récents
            </Button>
            <Button 
              variant={filter === "topRated" ? "secondary" : "outline"} 
              className="px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={() => handleFilterChange("topRated")}
            >
              <Icons.star className="mr-1 text-secondary" />
              Mieux notés
            </Button>
          </div>
        </div>
        
        <div className="md:hidden overflow-x-auto whitespace-nowrap pb-4 mb-4">
          <Button 
            variant={filter === "popular" ? "secondary" : "outline"} 
            className="mr-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium inline-block"
            onClick={() => handleFilterChange("popular")}
          >
            <Icons.fire className="mr-1 text-accent" />
            Populaires
          </Button>
          <Button 
            variant={filter === "recent" ? "secondary" : "outline"} 
            className="mr-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium inline-block"
            onClick={() => handleFilterChange("recent")}
          >
            <Icons.time className="mr-1 text-primary" />
            Récents
          </Button>
          <Button 
            variant={filter === "topRated" ? "secondary" : "outline"} 
            className="mr-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium inline-block"
            onClick={() => handleFilterChange("topRated")}
          >
            <Icons.star className="mr-1 text-secondary" />
            Mieux notés
          </Button>
        </div>
        
        {/* File Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, i) => (
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
            ))
          ) : (
            files?.map(file => <FileCard key={file.id} file={file} />)
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/explore">
            <Button 
              variant="outline" 
              className="px-6 py-3 bg-white border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
            >
              Voir plus de fichiers
              <Icons.arrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
