import type { LucideIcon } from 'lucide-react';

export type Role = 'admin' | 'marketing_manager' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  password?: string;
};

export type QRCodeData = {
  id: string;
  slug: string;
  targetUrl: string;
  fallbackUrls: string[];
  scanCount: number;
  createdAt: string;
  createdBy: string; // user id
};

export type NavItem = {
  href: string;
  title: string;
  icon: LucideIcon;
  role?: Role[];
};
