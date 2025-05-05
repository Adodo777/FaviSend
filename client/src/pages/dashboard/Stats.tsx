import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/assets/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileType } from "@/types";

type StatsDataPoint = {
  name: string;
  downloads: number;
  earnings: number;
};

export default function Stats() {
  const { user } = useAuth();

  const { data: files, isLoading } = useQuery<FileType[]>({
    queryKey: ["/api/files/user"],
    enabled: !!user?.uid,
  });

  const prepareChartData = (files: FileType[] | undefined): StatsDataPoint[] => {
    if (!files || files.length === 0) {
      return [
        { name: "Aucune donnée", downloads: 0, earnings: 0 }
      ];
    }

    // Sort files by downloads in descending order and take top 5
    return files
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5)
      .map(file => ({
        name: file.title.length > 15 ? file.title.substring(0, 15) + '...' : file.title,
        downloads: file.downloads,
        earnings: file.downloads * 450
      }));
  };

  const chartData = prepareChartData(files);
  const totalDownloads = files?.reduce((sum, file) => sum + file.downloads, 0) || 0;
  const totalEarnings = totalDownloads * 450;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-10">
            <Icons.loader className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!files || files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="rounded-full bg-gray-100 p-4">
              <Icons.barChart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">Aucune statistique disponible</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Uploadez des fichiers pour voir vos statistiques de téléchargement et vos revenus.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Téléchargements par fichier</CardTitle>
          <CardDescription>
            Nombre de téléchargements pour vos fichiers les plus populaires
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "downloads") return [`${value} téléchargements`, "Téléchargements"];
                    if (name === "earnings") return [`${value} FCFA`, "Revenus"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="downloads" fill="hsl(var(--primary))" name="Téléchargements" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Téléchargements Totaux
            </CardTitle>
            <Icons.download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              Sur tous vos fichiers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus Totaux
            </CardTitle>
            <Icons.wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEarnings} FCFA</div>
            <p className="text-xs text-muted-foreground">
              450 FCFA par téléchargement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre de Fichiers
            </CardTitle>
            <Icons.files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">
              {files.length === 1 ? 'Fichier uploadé' : 'Fichiers uploadés'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
