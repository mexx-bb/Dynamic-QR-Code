'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Trash, Edit, Download, Loader2, KeyRound, ShieldAlert, BarChart2 } from 'lucide-react';
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
  FormDescription,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type QRCodeWithUser = QRCodeData & { userName: string };

const formSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(3, { message: 'Slug muss mindestens 3 Zeichen lang sein.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Slug darf nur Buchstaben, Zahlen, _ und - enthalten.' }),
  targetUrl: z.string().url({ message: 'Bitte geben Sie eine gültige URL ein.' }),
  description: z.string().min(1, { message: 'Beschreibung ist erforderlich.' }),
  fallbackUrls: z.string().optional(),
  password: z.string().optional().nullable(),
  scanLimit: z.preprocess(
    (val) => (val === '' || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
});


export function QRCodesTable({ data, user }: { data: QRCodeWithUser[]; user: User }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingQR, setEditingQR] = React.useState<QRCodeData | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      slug: Math.random().toString(36).substring(2, 8),
      targetUrl: '',
      description: '',
      fallbackUrls: '',
      password: '',
      scanLimit: null,
    },
  });

  const watchedSlug = form.watch('slug');

  React.useEffect(() => {
    if (watchedSlug) {
      const qrUrl = `${window.location.origin}/q/${watchedSlug}`;
      setPreviewUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUrl)}&size=200x200`);
    } else {
      setPreviewUrl('');
    }
  }, [watchedSlug]);

  const handleOpenDialog = (qr: QRCodeData | null = null) => {
    setEditingQR(qr);
    if (qr) {
      form.reset({
        id: qr.id,
        slug: qr.slug,
        targetUrl: qr.targetUrl,
        description: qr.description,
        fallbackUrls: qr.fallbackUrls.join(', '),
        password: qr.password,
        scanLimit: qr.scanLimit,
      });
    } else {
      form.reset({ 
        id: '', 
        slug: Math.random().toString(36).substring(2, 8),
        targetUrl: '', 
        description: '', 
        fallbackUrls: '',
        password: '',
        scanLimit: null,
      });
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
    if (confirm('Sind Sie sicher, dass Sie diesen QR-Code archivieren möchten?')) {
      const result = await deleteQRCode(id);
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
        <h1 className="text-3xl font-bold tracking-tight">QR-Codes</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          QR-Code erstellen
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <TooltipProvider>
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
             {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No active QR codes found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">/q/{qr.slug}</Badge>
                        {qr.password && (
                          <Tooltip>
                            <TooltipTrigger>
                               <KeyRound className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Passwortgeschützt</TooltipContent>
                          </Tooltip>
                        )}
                        {qr.scanLimit && (
                           <Tooltip>
                            <TooltipTrigger>
                              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Scan-Limit: {qr.scanCount}/{qr.scanLimit}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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
                           <DropdownMenuItem asChild>
                             <Link href={`/admin/qr-codes/${qr.id}/analytics`}>
                               <BarChart2 className="mr-2 h-4 w-4" />
                               Analytics
                             </Link>
                           </DropdownMenuItem>
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
                            Archivieren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        </TooltipProvider>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingQR ? 'Bearbeiten' : 'Erstellen'} Sie einen QR-Code</DialogTitle>
            <DialogDescription>
              {editingQR ? 'Aktualisieren Sie die Details für Ihren QR-Code.' : 'Geben Sie die Details für Ihren neuen QR-Code ein.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
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
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kurzlink (Slug)</FormLabel>
                          <FormControl>
                            <Input placeholder="mein-slug" {...field} />
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort / PIN (optional)</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="z.B. 1234" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="scanLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scan-Limit (optional)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="z.B. 100" {...field} value={field.value ?? ''} />
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
                          <FormDescription>
                            Durch Kommas getrennte URLs.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-4">
                    <p className="text-sm font-medium">QR-Code-Vorschau</p>
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="QR-Code-Vorschau"
                            width={200}
                            height={200}
                            className="rounded-md"
                        />
                    ) : (
                        <div className="flex h-[200px] w-[200px] items-center justify-center rounded-md bg-muted text-center text-sm text-muted-foreground">
                            Geben Sie einen Slug ein, um eine Vorschau zu sehen
                        </div>
                    )}
                     <p className="text-xs text-muted-foreground">Verlinkt auf /q/{watchedSlug || '...'}</p>
                </div>
              </div>
               <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Änderungen speichern
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
