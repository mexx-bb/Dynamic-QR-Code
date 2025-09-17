import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function LinkErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">Link Unavailable</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        The destination for this QR code is currently unavailable. Please try again later.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
