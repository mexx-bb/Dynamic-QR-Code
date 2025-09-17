import type { User, QRCodeData } from '@/types';

export const users: User[] = [
  {
    id: '1',
    name: 'Admin-Benutzer',
    email: 'mexx@web.de',
    avatarUrl: 'https://picsum.photos/seed/user1/100/100',
    role: 'admin',
    password: 'qrcoder12345678!',
  },
  {
    id: '2',
    name: 'Marketing-Manager',
    email: 'manager@example.com',
    avatarUrl: 'https://picsum.photos/seed/user2/100/100',
    role: 'marketing_manager',
    password: 'password',
  },
  {
    id: '3',
    name: 'Standardbenutzer',
    email: 'user@example.com',
    avatarUrl: 'https://picsum.photos/seed/user3/100/100',
    role: 'user',
    password: 'password',
  },
];

export let qrCodes: QRCodeData[] = [
  {
    id: '1',
    slug: 'promo1',
    targetUrl: 'https://example.com/special-offer',
    description: 'Sonderangebot für Herbst-Kampagne',
    fallbackUrls: ['https://example.com/offers', 'https://example.com/'],
    scanCount: 125,
    createdAt: '2023-10-01T10:00:00Z',
    createdBy: '2',
    status: 'active',
  },
  {
    id: '2',
    slug: 'event-rsvp',
    targetUrl: 'https://example.com/unavailable-event', // This URL will fail
    description: 'Anmeldung für das jährliche Firmenevent',
    fallbackUrls: ['https://example.com/events/fallback-info', 'https://example.com/events'],
    scanCount: 78,
    createdAt: '2023-10-05T14:30:00Z',
    createdBy: '2',
    status: 'active',
  },
  {
    id: '3',
    slug: 'product-launch',
    targetUrl: 'https://example.com/new-product',
    description: 'Einführung des neuen "Super-Gadgets"',
    fallbackUrls: [],
    scanCount: 340,
    createdAt: '2023-10-10T09:00:00Z',
    createdBy: '1',
    status: 'active',
  },
];
