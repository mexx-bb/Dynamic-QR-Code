import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <SearchX className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
