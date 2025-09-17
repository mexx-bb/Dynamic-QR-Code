import { BarChart, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { qrCodes, users } from '@/lib/data';

export default async function DashboardPage() {
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0);
  const totalQRCodes = qrCodes.length;

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQRCodes}</div>
            <p className="text-xs text-muted-foreground">
              Actively managed QR codes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all QR codes
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {qrCodes.slice(0, 5).map(qr => {
                const user = users.find(u => u.id === qr.createdBy);
                return (
                  <div key={qr.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">/{qr.slug}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">{qr.targetUrl}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-medium">{qr.scanCount.toLocaleString()} scans</p>
                       {user && <p className="text-sm text-muted-foreground">by {user.name}</p>}
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
