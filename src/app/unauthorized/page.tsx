import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">Zugriff verweigert</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Sie haben keine Berechtigung, diese Seite anzuzeigen.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Zurück zur Startseite</Link>
      </Button>
    </div>
  );
}
