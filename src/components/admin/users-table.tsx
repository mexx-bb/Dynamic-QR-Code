'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole } from '@/lib/actions';
import type { User, Role } from '@/types';

const roleMap: Record<Role, { label: string; style: string }> = {
  admin: { label: 'Admin', style: 'bg-primary/80 hover:bg-primary/70' },
  marketing_manager: { label: 'Manager', style: 'bg-yellow-500/80 hover:bg-yellow-500/70' },
  user: { label: 'Benutzer', style: 'bg-green-500/80 hover:bg-green-500/70' },
};

export function UsersTable({ data }: { data: User[] }) {
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, role: Role) => {
    const result = await updateUserRole(userId, role);
    if (result.success) {
      toast({ title: 'Erfolg', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Fehler', description: result.error });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Benutzer</h1>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Benutzer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rolle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(roleMap).map((roleKey) => (
                        <SelectItem key={roleKey} value={roleKey}>
                          {roleMap[roleKey as Role].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
