import type { LucideIcon } from 'lucide-react';

export type Role = 'admin' | 'marketing_manager' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
};

export type VCardData = {
  firstName: string;
  lastName: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
};

export type QRCodeDataBase = {
  id: string;
  slug: string;
  description: string;
  createdAt: string;
  createdBy: string; // user id
  status: 'active' | 'archived' | 'expired';
}

export type QRCodeURL = QRCodeDataBase & {
  type: 'url';
  targetUrl: string;
  fallbackUrls: string[];
  scanCount: number;
  password?: string | null;
  scanLimit?: number | null;
  scanHistory?: { date: string; scans: number }[];
};

export type QRCodeVCard = QRCodeDataBase & {
  type: 'vcard';
  vCardData: VCardData;
};

export type QRCodeData = QRCodeURL | QRCodeVCard;


export type NavItem = {
  href: string;
  title: string;
  icon: LucideIcon;
  role?: Role[];
};
