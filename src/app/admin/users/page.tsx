import { getSession } from '@/lib/auth';
import { users } from '@/lib/data';
import { UsersTable } from '@/components/admin/users-table';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const user = await getSession();

  if (user?.role !== 'admin') {
    redirect('/admin');
  }

  // In a real app, you'd fetch this from a database
  const allUsers = users;

  return (
    <div className="space-y-6">
      <UsersTable data={allUsers} />
    </div>
  );
}
