import { BarChart, QrCode, Contact } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { qrCodes, users } from '@/lib/data';
import { ScanAnalyticsChart } from '@/components/admin/scan-analytics-chart';
import { subDays, format } from 'date-fns';

// In a real app, this data would come from a database with scan timestamps.
// For this demo, we'll generate some random data.
function getScanDataForLast7Days() {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    // Generate a random number of scans for each day
    const scans = Math.floor(Math.random() * 200) + 50;
    data.push({
      date: format(date, 'MMM d'),
      scans: scans,
    });
  }
  return data;
}


export default async function DashboardPage() {
  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.type === 'url' ? qr.scanCount : 0), 0);
  const totalQRCodes = qrCodes.length;
  const scanData = getScanDataForLast7Days();

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR-Codes Gesamt</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQRCodes}</div>
            <p className="text-xs text-muted-foreground">
              Aktiv verwaltete QR-Codes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans Gesamt</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Über alle URL-basierten QR-Codes
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan-Aktivität (Letzte 7 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
             <ScanAnalyticsChart data={scanData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Letzte QR-Codes</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {qrCodes.slice(0, 5).map(qr => {
                const user = users.find(u => u.id === qr.createdBy);
                return (
                  <div key={qr.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">/q/{qr.slug}</p>
                      {qr.type === 'url' ? (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{qr.targetUrl}</p>
                      ): (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Contact className="h-3 w-3" />
                          <span>vCard: {qr.vCardData.firstName} {qr.vCardData.lastName}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                       {qr.type === 'url' ? (
                          <p className="font-medium">{qr.scanCount.toLocaleString()} Scans</p>
                       ) : (
                          <p className="font-medium text-sm text-muted-foreground">Kontakt</p>
                       )}
                       {user && <p className="text-sm text-muted-foreground">von {user.name}</p>}
                    </div>
                  </div>
                )
              })}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    