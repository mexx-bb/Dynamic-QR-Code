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
  return { success: true };
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
  targetUrl: z.string().url({ message: 'Bitte geben Sie eine gültige URL ein.' }),
  fallbackUrls: z.string().optional(),
});

export async function saveQRCode(values: z.infer<typeof QRCodeSchema>, creatorId: string) {
  const validatedFields = QRCodeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Ungültige Felder!' };
  }

  const { id, targetUrl, fallbackUrls } = validatedFields.data;
  const fallbackUrlArray = fallbackUrls ? fallbackUrls.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (id) {
    // Update existing
    const qrCode = qrCodesData.find(qr => qr.id === id);
    if (qrCode) {
      qrCode.targetUrl = targetUrl;
      qrCode.fallbackUrls = fallbackUrlArray;
    }
  } else {
    // Create new
    const newQRCode = {
      id: (qrCodesData.length + 1).toString(),
      slug: Math.random().toString(36).substring(2, 8),
      targetUrl,
      fallbackUrls: fallbackUrlArray,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: creatorId,
    };
    qrCodesData.push(newQRCode);
  }
  revalidatePath('/admin/qr-codes');
  return { success: true, message: `QR-Code wurde erfolgreich ${id ? 'aktualisiert' : 'erstellt'}.` };
}

export async function deleteQRCode(id: string) {
    const index = qrCodesData.findIndex(qr => qr.id === id);
    if (index !== -1) {
        qrCodesData.splice(index, 1);
        revalidatePath('/admin/qr-codes');
        return { success: true, message: 'QR-Code gelöscht.' };
    }
    return { error: 'QR-Code nicht gefunden.' };
}
