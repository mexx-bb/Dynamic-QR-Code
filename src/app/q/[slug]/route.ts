import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getQRCodeBySlug, logScan } from '@/lib/firestore';
import type { VCardData, QRCodeData, QRCodeURL } from '@/types';
import { timingSafeEqual } from 'crypto';

export const runtime = 'nodejs'; // Use nodejs runtime for crypto and firebase-admin

async function verifyPin(providedPin: string, storedPinHash: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const data = encoder.encode(providedPin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const providedPinHash = Buffer.from(hashBuffer).toString('hex');
    
    const storedHashBuffer = Buffer.from(storedPinHash, 'hex');
    const providedHashBuffer = Buffer.from(providedPinHash, 'hex');

    if (storedHashBuffer.length !== providedHashBuffer.length) {
        return false;
    }

    return timingSafeEqual(storedHashBuffer, providedHashBuffer);
}

function generateVCard(data: VCardData): string {
    const { firstName, lastName, company, title, phone, email, website, address } = data;
    let vCardString = "BEGIN:VCARD\n";
    vCardString += "VERSION:3.0\n";
    vCardString += `N:${lastName};${firstName}\n`;
    vCardString += `FN:${firstName} ${lastName}\n`;
    if (company) vCardString += `ORG:${company}\n`;
    if (title) vCardString += `TITLE:${title}\n`;
    if (phone) vCardString += `TEL;TYPE=WORK,VOICE:${phone}\n`;
    if (email) vCardString += `EMAIL:${email}\n`;
    if (website) vCardString += `URL:${website}\n`;
    if (address) vCardString += `ADR;TYPE=WORK:;;${address}\n`;
    vCardString += "END:VCARD";
    return vCardString;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const qrCode: QRCodeData | null = await getQRCodeBySlug(slug);

  if (!qrCode || qrCode.status !== 'active') {
    return NextResponse.redirect(new URL('/link-error', request.url));
  }

  // Handle vCard type
  if (qrCode.type === 'vcard') {
      const vCardString = generateVCard(qrCode.vCardData);
      // Log the scan for vCard as well
      // Not awaiting this intentionally to speed up the response
      logScan(qrCode.id, request.headers.get('user-agent') || '', request.ip);
      return new NextResponse(vCardString, {
          status: 200,
          headers: {
              'Content-Type': 'text/vcard;charset=utf-8',
              'Content-Disposition': `attachment; filename="${qrCode.slug}.vcf"`,
          },
      });
  }

  const qrCodeUrl = qrCode as QRCodeURL;

  // Handle Scan Limit
  if (qrCodeUrl.scanLimit && qrCodeUrl.scanCount >= qrCodeUrl.scanLimit) {
     return NextResponse.redirect(new URL('/link-error', request.url));
  }

  // Handle Password Protection
  const providedPin = request.nextUrl.searchParams.get('pin');
  if (qrCodeUrl.password) {
    if (!providedPin || !(await verifyPin(providedPin, qrCodeUrl.password))) {
      const pinPromptUrl = new URL(`/q/${slug}/auth`, request.url);
      if (providedPin !== null) { // only add error if a pin was provided
        pinPromptUrl.searchParams.set('error', 'Die eingegebene PIN ist falsch. Bitte versuchen Sie es erneut.');
      }
      return NextResponse.redirect(pinPromptUrl);
    }
  }

  // Log the scan before redirecting
  // Not awaiting this intentionally to speed up the response
  logScan(qrCode.id, request.headers.get('user-agent') || '', request.ip);
  
  // Finally, redirect to the target URL
  return NextResponse.redirect(qrCodeUrl.targetUrl);
}
