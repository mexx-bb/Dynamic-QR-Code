import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { qrCodes } from '@/lib/data';
import { intelligentFallback } from '@/ai/flows/intelligent-fallback';

export const runtime = 'edge';

async function isUrlAvailable(url: string): Promise<boolean> {
  // Mocking the check for the "unavailable" URL for demonstration
  if (url.includes('unavailable')) {
    return false;
  }
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch (error) {
    console.error(`URL check failed for ${url}:`, error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const qrCode = qrCodes.find((qr) => qr.slug === slug);

  if (!qrCode || qrCode.status !== 'active') {
    return NextResponse.redirect(new URL('/link-error', request.url));
  }

  // Handle Scan Limit
  if (qrCode.scanLimit && qrCode.scanCount >= qrCode.scanLimit) {
    qrCode.status = 'expired';
     return NextResponse.redirect(new URL('/link-error', request.url));
  }

  // Handle Password Protection
  const password = request.nextUrl.searchParams.get('pin');
  if (qrCode.password) {
    if (password !== qrCode.password) {
      const pinPromptUrl = new URL(`/q/${slug}/auth`, request.url);
      return NextResponse.redirect(pinPromptUrl);
    }
  }

  // In a real database, this would be an atomic update.
  qrCode.scanCount += 1;

  const primaryUrlIsUp = await isUrlAvailable(qrCode.targetUrl);

  if (primaryUrlIsUp) {
    return NextResponse.redirect(qrCode.targetUrl);
  }

  // Primary URL is down, try to find a fallback
  if (qrCode.fallbackUrls && qrCode.fallbackUrls.length > 0) {
    try {
      const fallback = await intelligentFallback({
        primaryUrl: qrCode.targetUrl,
        fallbackUrls: qrCode.fallbackUrls,
        reason: 'The primary URL was unreachable or returned an error.',
      });
      
      if (fallback.chosenUrl) {
        return NextResponse.redirect(fallback.chosenUrl);
      }
    } catch (aiError) {
      console.error('Intelligent fallback failed:', aiError);
      // If AI fails, redirect to the first fallback as a last resort
      return NextResponse.redirect(qrCode.fallbackUrls[0]);
    }
  }

  // If no fallbacks are available or the AI fails without a default, redirect to a generic error page
  return NextResponse.redirect(new URL('/link-error', request.url));
}
