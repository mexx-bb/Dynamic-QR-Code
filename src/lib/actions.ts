'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { timingSafeEqual, createHash } from 'crypto';

import { users, qrCodes as qrCodesData } from '@/lib/data';
import type { Role, QRCodeData } from '@/types';


export async function updateUserRole(userId: string, role: Role) {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.role = role;
    revalidatePath('/admin/users');
    return { success: true, message: `Die Rolle von Benutzer ${user.name} wurde auf ${role} aktualisiert.` };
  }
  return { error: 'Benutzer nicht gefunden.' };
}

const urlSchema = z.object({
  type: z.literal('url'),
  targetUrl: z.string().url({ message: 'Bitte geben Sie eine gültige URL ein.' }),
  fallbackUrls: z.string().optional(),
  password: z.string().optional().nullable(),
  scanLimit: z.preprocess(
    (val) => (val === '' || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
});

const vCardSchema = z.object({
    type: z.literal('vcard'),
    vCardData: z.object({
        firstName: z.string().min(1, 'Vorname ist erforderlich'),
        lastName: z.string().min(1, 'Nachname ist erforderlich'),
        company: z.string().optional(),
        title: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' }).optional().or(z.literal('')),
        website: z.string().url({ message: 'Ungültige Website-URL.' }).optional().or(z.literal('')),
        address: z.string().optional(),
    }),
});

const QRCodeSchema = z.object({
    id: z.string().optional(),
    slug: z.string().min(3, { message: 'Slug muss mindestens 3 Zeichen lang sein.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Slug darf nur Buchstaben, Zahlen, _ und - enthalten.' }),
    description: z.string().min(1, { message: 'Beschreibung ist erforderlich.' }),
}).and(z.discriminatedUnion('type', [urlSchema, vCardSchema]));

async function hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Buffer.from(hashBuffer).toString('hex');
}

export async function saveQRCode(values: z.infer<typeof QRCodeSchema>, creatorId: string) {
  const validatedFields = QRCodeSchema.safeParse(values);
  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || 'Ungültige Felder!' };
  }

  const { id, slug, description } = validatedFields.data;

  const existingSlug = qrCodesData.find(qr => qr.slug === slug && qr.id !== id);
  if (existingSlug) {
    return { error: 'Dieser Kurzlink (Slug) wird bereits verwendet.' };
  }

  let passwordHash: string | null = null;
  if (validatedFields.data.type === 'url' && validatedFields.data.password) {
      passwordHash = await hashPin(validatedFields.data.password);
  }

  if (id) {
    const qrCodeIndex = qrCodesData.findIndex(qr => qr.id === id);
    if (qrCodeIndex !== -1) {
       const existingQr = qrCodesData[qrCodeIndex];
       if (validatedFields.data.type === 'url') {
            qrCodesData[qrCodeIndex] = {
                ...existingQr,
                type: 'url',
                slug,
                description,
                targetUrl: validatedFields.data.targetUrl,
                fallbackUrls: validatedFields.data.fallbackUrls ? validatedFields.data.fallbackUrls.split(',').map(s => s.trim()).filter(Boolean) : [],
                password: passwordHash,
                scanLimit: validatedFields.data.scanLimit,
            } as QRCodeData;
       } else {
            qrCodesData[qrCodeIndex] = {
                 ...existingQr,
                type: 'vcard',
                slug,
                description,
                vCardData: validatedFields.data.vCardData,
            } as QRCodeData
       }
    }
  } else {
    const commonData = {
        id: (qrCodesData.length + 1).toString(),
        slug,
        description,
        createdAt: new Date().toISOString(),
        createdBy: creatorId,
        status: 'active' as const,
    };
    
    if (validatedFields.data.type === 'url') {
        const newQRCode: QRCodeData = {
            ...commonData,
            type: 'url',
            targetUrl: validatedFields.data.targetUrl,
            fallbackUrls: validatedFields.data.fallbackUrls ? validatedFields.data.fallbackUrls.split(',').map(s => s.trim()).filter(Boolean) : [],
            scanCount: 0,
            password: passwordHash,
            scanLimit: validatedFields.data.scanLimit,
        };
        qrCodesData.push(newQRCode);
    } else {
         const newQRCode: QRCodeData = {
            ...commonData,
            type: 'vcard',
            vCardData: validatedFields.data.vCardData,
        };
        qrCodesData.push(newQRCode);
    }
  }
  revalidatePath('/admin/qr-codes');
  return { success: true, message: `QR-Code wurde erfolgreich ${id ? 'aktualisiert' : 'erstellt'}.` };
}

export async function deleteQRCode(id: string) {
    const qrCode = qrCodesData.find(qr => qr.id === id);
    if (qrCode) {
        qrCode.status = 'archived';
        revalidatePath('/admin/qr-codes');
        revalidatePath('/admin/archiv');
        return { success: true, message: 'QR-Code wurde archiviert.' };
    }
    return { error: 'QR-Code nicht gefunden.' };
}

export async function restoreQRCode(id: string) {
  const qrCode = qrCodesData.find(qr => qr.id === id);
  if (qrCode) {
    qrCode.status = 'active';
    revalidatePath('/admin/qr-codes');
    revalidatePath('/admin/archiv');
    return { success: true, message: 'QR-Code wurde wiederhergestellt.' };
  }
  return { error: 'QR-Code nicht gefunden.' };
}

export async function permanentlyDeleteQRCode(id: string) {
  const index = qrCodesData.findIndex(qr => qr.id === id && qr.status === 'archived');
  if (index !== -1) {
    qrCodesData.splice(index, 1);
    revalidatePath('/admin/archiv');
    return { success: true, message: 'QR-Code endgültig gelöscht.' };
  }
  return { error: 'Zu löschender QR-Code nicht im Archiv gefunden.' };
}
