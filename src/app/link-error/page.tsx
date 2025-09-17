import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function LinkErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">Link nicht verfügbar</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Das Ziel für diesen QR-Code ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Zurück zur Startseite</Link>
      </Button>
    </div>
  );
}
