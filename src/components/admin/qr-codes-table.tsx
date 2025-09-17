'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Trash, Edit, Download, Loader2 } from 'lucide-react';
import Image from 'next/image';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveQRCode, deleteQRCode } from '@/lib/actions';
import type { QRCodeData, User } from '@/types';
import { Badge } from '../ui/badge';

type QRCodeWithUser = QRCodeData & { userName: string };

const formSchema = z.object({
  id: z.string().optional(),
  targetUrl: z.string().url({ message: 'Bitte geben Sie eine gültige URL ein.' }),
  description: z.string().min(1, { message: 'Beschreibung ist erforderlich.' }),
  fallbackUrls: z.string().optional(),
});

export function QRCodesTable({ data, user }: { data: QRCodeWithUser[]; user: User }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingQR, setEditingQR] = React.useState<QRCodeData | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      targetUrl: '',
      description: '',
      fallbackUrls: '',
    },
  });

  const handleOpenDialog = (qr: QRCodeData | null = null) => {
    setEditingQR(qr);
    if (qr) {
      form.reset({
        id: qr.id,
        targetUrl: qr.targetUrl,
        description: qr.description,
        fallbackUrls: qr.fallbackUrls.join(', '),
      });
    } else {
      form.reset({ id: '', targetUrl: '', description: '', fallbackUrls: '' });
    }
    setIsDialogOpen(true);
  };
  
  const handleDownload = (slug: string) => {
    const qrUrl = `${window.location.origin}/q/${slug}`;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUrl)}&size=300x300&format=png`;
    
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = apiUrl;
    link.download = `${slug}-qrcode.png`;
    link.target = '_blank'; // Fallback for browsers that don't support download attribute well
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await saveQRCode(values, user.id);
    if (result.success) {
      toast({ title: 'Erfolg', description: result.message });
      setIsDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Fehler', description: result.error });
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (confirm('Sind Sie sicher, dass Sie diesen QR-Code löschen möchten?')) {
      const result = await deleteQRCode(id);
      if (result.success) {
        toast({ title: 'Erfolg', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Fehler', description: result.error });
      }
    }
  }
  
  const getQrCodeUrl = (slug: string) => {
    if (typeof window === 'undefined') return '';
    const qrUrl = `${window.location.origin}/q/${slug}`;
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUrl)}&size=200x200`;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">QR-Codes</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          QR-Code erstellen
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kurz-URL</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead>Ziel-URL</TableHead>
              <TableHead className="text-center">Scans</TableHead>
              <TableHead>Erstellt von</TableHead>
              <TableHead>
                <span className="sr-only">Aktionen</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((qr) => (
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
                <TableCell className="text-center">{qr.scanCount.toLocaleString()}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleOpenDialog(qr)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleDownload(qr.slug)}>
                        <Download className="mr-2 h-4 w-4" />
                        QR herunterladen
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(qr.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingQR ? 'Bearbeiten' : 'Erstellen'} Sie einen QR-Code</DialogTitle>
            <DialogDescription>
              {editingQR ? 'Aktualisieren Sie die Details für Ihren QR-Code.' : 'Geben Sie die Details für Ihren neuen QR-Code ein.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="targetUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ziel-URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/my-link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Herbst-Kampagne" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fallbackUrls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fallback-URLs (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="https://fallback1.com, https://fallback2.com"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Durch Kommas getrennte URLs, die verwendet werden sollen, wenn das Ziel nicht verfügbar ist.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-4">
                <p className="text-sm font-medium">QR-Code-Vorschau</p>
                {editingQR?.slug ? (
                    <Image
                        src={getQrCodeUrl(editingQR.slug)}
                        alt="QR-Code-Vorschau"
                        width={200}
                        height={200}
                        className="rounded-md"
                    />
                ) : (
                    <div className="flex h-[200px] w-[200px] items-center justify-center rounded-md bg-muted text-center text-sm text-muted-foreground">
                        Speichern, um eine Vorschau zu generieren
                    </div>
                )}
                 <p className="text-xs text-muted-foreground">Verlinkt auf /q/{editingQR?.slug || '...'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Änderungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
