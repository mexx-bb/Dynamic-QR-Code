import type { User, QRCodeData } from '@/types';

// Helper function to generate scan history for the last 7 days
const generateScanHistory = (totalScans: number) => {
  if (totalScans === 0) return [];
  
  const history: { date: string; scans: number }[] = [];
  let remainingScans = totalScans;
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    let dailyScans = 0;
    if (remainingScans > 0) {
      // On the last day, assign all remaining scans
      if (i === 0) {
        dailyScans = remainingScans;
      } else {
        // Assign a random portion of the remaining scans, ensuring it's not more than what's left
        const maxPossible = Math.floor(remainingScans / (i + 1));
        dailyScans = Math.floor(Math.random() * maxPossible) + 1;
        remainingScans -= dailyScans;
      }
    }
    
    history.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      scans: dailyScans,
    });
  }

  // If there are still scans left (e.g. if total was very low), add them to the last day
  if (remainingScans > 0) {
    history[6].scans += remainingScans;
  }
  
  return history;
};


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
    password: null,
    scanLimit: null,
    scanHistory: generateScanHistory(125),
  },
  {
    id: '2',
    slug: 'event-rsvp',
    targetUrl: 'https://example.com/unavailable-event', // This URL will fail
    description: 'Anmeldung für das jährliche Firmenevent (Passwort: 1234)',
    fallbackUrls: ['https://example.com/events/fallback-info', 'https://example.com/events'],
    scanCount: 78,
    createdAt: '2023-10-05T14:30:00Z',
    createdBy: '2',
    status: 'active',
    password: '1234',
    scanLimit: null,
    scanHistory: generateScanHistory(78),
  },
  {
    id: '3',
    slug: 'product-launch',
    targetUrl: 'https://example.com/new-product',
    description: 'Einführung des neuen "Super-Gadgets" (limitiert auf 500 Scans)',
    fallbackUrls: [],
    scanCount: 340,
    createdAt: '2023-10-10T09:00:00Z',
    createdBy: '1',
    status: 'active',
    password: null,
    scanLimit: 500,
    scanHistory: generateScanHistory(340),
  },
];
