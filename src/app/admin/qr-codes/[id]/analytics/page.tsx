import { qrCodes } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanAnalyticsChart } from '@/components/admin/scan-analytics-chart';
import { BarChart, Users, QrCode } from 'lucide-react';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function QRCodeAnalyticsPage({ params }: { params: { id: string } }) {
  const qrCode = qrCodes.find(qr => qr.id === params.id);

  if (!qrCode) {
    notFound();
  }
  
  const scanHistory = qrCode.scanHistory || [];
  const chartData = scanHistory.map(item => ({
    date: format(new Date(item.date), 'd. MMM', { locale: de }),
    scans: item.scans,
  }));

  // Simulate unique scans as a percentage of total scans
  const uniqueScans = Math.floor(qrCode.scanCount * (Math.random() * (0.9 - 0.7) + 0.7));

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
         <Button asChild variant="outline" size="icon">
            <Link href="/admin/qr-codes">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Zurück</span>
            </Link>
         </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics für /q/{qrCode.slug}</h1>
            <p className="text-muted-foreground truncate max-w-2xl">{qrCode.description}</p>
        </div>
       </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans Gesamt</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCode.scanCount.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              Gesamtzahl der Scans
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Einzigartige Scans (simuliert)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueScans.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              Geschätzte Anzahl einzigartiger Benutzer
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ziel-URL</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <a href={qrCode.targetUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate block">
                {qrCode.targetUrl}
            </a>
             <p className="text-xs text-muted-foreground">
              Primäres Weiterleitungsziel
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan-Aktivität (Letzte 7 Tage)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ScanAnalyticsChart data={chartData} />
          ) : (
             <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                Keine Scan-Daten für diesen Zeitraum verfügbar.
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
