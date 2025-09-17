import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">Access Denied</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        You do not have permission to view this page.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
