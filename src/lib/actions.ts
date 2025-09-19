'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { users, qrCodes as qrCodesData } from '@/lib/data';
import { createSession, deleteSession } from '@/lib/auth';
import type { Role } from '@/types';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Ungültige Felder!' };
  }

  const { email, password } = validatedFields.data;
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return { error: 'Ungültige E-Mail oder Passwort' };
  }

  await createSession(email);
  
  if (user.role === 'admin' || user.role === 'marketing_manager') {
    redirect('/admin');
  } else {
    redirect('/'); // Or a different page for 'user' role if needed
  }
}

export async function logout() {
  await deleteSession();
  redirect('/');
}

export async function updateUserRole(userId: string, role: Role) {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.role = role;
    revalidatePath('/admin/users');
    return { success: true, message: `Die Rolle von Benutzer ${user.name} wurde auf ${role} aktualisiert.` };
  }
  return { error: 'Benutzer nicht gefunden.' };
}

const QRCodeSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(3, { message: 'Slug muss mindestens 3 Zeichen lang sein.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Slug darf nur Buchstaben, Zahlen, _ und - enthalten.' }),
  targetUrl: z.string().url({ message: 'Bitte geben Sie eine gültige URL ein.' }),
  description: z.string().min(1, { message: 'Beschreibung ist erforderlich.' }),
  fallbackUrls: z.string().optional(),
  password: z.string().optional().nullable(),
  scanLimit: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
});

export async function saveQRCode(values: z.infer<typeof QRCodeSchema>, creatorId: string) {
  const validatedFields = QRCodeSchema.safeParse(values);
  if (!validatedFields.success) {
    // Flatten errors to a simple object
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || 'Ungültige Felder!' };
  }

  const { id, slug, targetUrl, description, fallbackUrls, password, scanLimit } = validatedFields.data;
  const fallbackUrlArray = fallbackUrls ? fallbackUrls.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Check for slug uniqueness
  const existingSlug = qrCodesData.find(qr => qr.slug === slug && qr.id !== id);
  if (existingSlug) {
    return { error: 'Dieser Kurzlink (Slug) wird bereits verwendet.' };
  }

  if (id) {
    // Update existing
    const qrCode = qrCodesData.find(qr => qr.id === id);
    if (qrCode) {
      qrCode.targetUrl = targetUrl;
      qrCode.slug = slug;
      qrCode.description = description;
      qrCode.fallbackUrls = fallbackUrlArray;
      qrCode.password = password;
      qrCode.scanLimit = scanLimit;
    }
  } else {
    // Create new
    const newQRCode = {
      id: (qrCodesData.length + 1).toString(),
      slug: slug,
      targetUrl,
      description,
      fallbackUrls: fallbackUrlArray,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: creatorId,
      status: 'active' as const,
      password: password,
      scanLimit: scanLimit,
    };
    qrCodesData.push(newQRCode);
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
