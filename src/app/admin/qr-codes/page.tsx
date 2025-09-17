import { qrCodes, users } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { QRCodesTable } from '@/components/admin/qr-codes-table';
import type { User } from '@/types';
import { redirect } from 'next/navigation';

export default async function QRCodesPage() {
  const sessionUser = await getSession();

  if (!sessionUser) {
    redirect('/');
  }
  
  // In a real app, you'd fetch this from a database
  const codesWithUsers = qrCodes.map(qr => {
    const user = users.find(u => u.id === qr.createdBy);
    return { ...qr, userName: user?.name || 'Unknown' };
  });

  return (
    <div className="space-y-6">
      <QRCodesTable data={codesWithUsers} user={sessionUser} />
    </div>
  );
}
