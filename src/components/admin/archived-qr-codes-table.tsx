'use client';

import * as React from 'react';
import { MoreHorizontal, Trash, ArchiveRestore, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { restoreQRCode, permanentlyDeleteQRCode } from '@/lib/actions';
import type { QRCodeData } from '@/types';
import { Badge } from '../ui/badge';

type QRCodeWithUser = QRCodeData & { userName: string };

export function ArchivedQRCodesTable({ data }: { data: QRCodeWithUser[] }) {
  const { toast } = useToast();

  async function handleRestore(id: string) {
    const result = await restoreQRCode(id);
    if (result.success) {
      toast({ title: 'Erfolg', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Fehler', description: result.error });
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Sind Sie sicher, dass Sie diesen QR-Code endgültig löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      const result = await permanentlyDeleteQRCode(id);
      if (result.success) {
        toast({ title: 'Erfolg', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Fehler', description: result.error });
      }
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Archivierte QR-Codes</h1>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kurz-URL</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead>Ziel-URL</TableHead>
              <TableHead>Erstellt von</TableHead>
              <TableHead>
                <span className="sr-only">Aktionen</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Keine archivierten QR-Codes gefunden.
                </TableCell>
              </TableRow>
            ) : (
                data.map((qr) => (
                <TableRow key={qr.id}>
                    <TableCell>
                    <Badge variant="secondary">/q/{qr.slug}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-medium">{qr.description}</TableCell>
                    <TableCell className="max-w-sm truncate">
                    <a href={qr.targetUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {qr.targetUrl}
                    </a>
                    </TableCell>
                    <TableCell>{qr.userName}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menü öffnen</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRestore(qr.id)}>
                            <ArchiveRestore className="mr-2 h-4 w-4" />
                            Wiederherstellen
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(qr.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Endgültig löschen
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
