import { qrCodes, users } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { ArchivedQRCodesTable } from '@/components/admin/archived-qr-codes-table';
import { redirect } from 'next/navigation';

export default async function ArchivedQRCodesPage() {
  const sessionUser = await getSession();

  if (!sessionUser) {
    redirect('/');
  }
  
  const archivedCodes = qrCodes.filter(qr => qr.status === 'archived');
  const codesWithUsers = archivedCodes.map(qr => {
    const user = users.find(u => u.id === qr.createdBy);
    return { ...qr, userName: user?.name || 'Unknown' };
  });

  return (
    <div className="space-y-6">
      <ArchivedQRCodesTable data={codesWithUsers} />
    </div>
  );
}
