'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function QRCodeAuthPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(searchParams.get('error'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const currentPath = `/q/${params.slug}`;
    const newUrl = `${currentPath}?pin=${pin}`;
    router.replace(newUrl);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>PIN erforderlich</CardTitle>
            <CardDescription>Dieser Link ist passwortgeschützt. Bitte geben Sie die PIN ein, um fortzufahren.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Falsche PIN</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Input
              type="password"
              placeholder="Geben Sie Ihre PIN ein"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              className="text-center text-lg"
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Entsperren
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
