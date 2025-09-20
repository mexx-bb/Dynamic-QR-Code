'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Trash, Edit, Download, Loader2, KeyRound, ShieldAlert, BarChart2, Contact } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ScrollArea } from '../ui/scroll-area';

type QRCodeWithUser = QRCodeData & { userName: string };

const urlSchema = z.object({
  type: z.literal('url'),
  targetUrl: z.string().url({ message: 'Bitte geben Sie eine gültige URL ein.' }),
  fallbackUrls: z.string().optional(),
  password: z.string().optional().nullable(),
  scanLimit: z.preprocess(
    (val) => (val === '' || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
});

const vCardSchema = z.object({
    type: z.literal('vcard'),
    vCardData: z.object({
        firstName: z.string().min(1, 'Vorname ist erforderlich'),
        lastName: z.string().min(1, 'Nachname ist erforderlich'),
        company: z.string().optional(),
        title: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' }).optional().or(z.literal('')),
        website: z.string().url({ message: 'Ungültige Website-URL.' }).optional().or(z.literal('')),
        address: z.string().optional(),
    }),
});

const formSchema = z.object({
    id: z.string().optional(),
    slug: z.string().min(3, { message: 'Slug muss mindestens 3 Zeichen lang sein.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Slug darf nur Buchstaben, Zahlen, _ und - enthalten.' }),
    description: z.string().min(1, { message: 'Beschreibung ist erforderlich.' }),
}).and(z.discriminatedUnion('type', [urlSchema, vCardSchema]));


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
      type: 'url',
      slug: Math.random().toString(36).substring(2, 8),
      description: '',
      targetUrl: '',
      fallbackUrls: '',
      password: '',
      scanLimit: null,
      vCardData: {
          firstName: '',
          lastName: '',
      }
    },
  });

  const watchedSlug = form.watch('slug');
  const watchedType = form.watch('type');

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
        if (qr.type === 'url') {
             form.reset({
                id: qr.id,
                type: 'url',
                slug: qr.slug,
                description: qr.description,
                targetUrl: qr.targetUrl,
                fallbackUrls: qr.fallbackUrls.join(', '),
                password: qr.password,
                scanLimit: qr.scanLimit,
            });
        } else {
            form.reset({
                id: qr.id,
                type: 'vcard',
                slug: qr.slug,
                description: qr.description,
                vCardData: qr.vCardData,
            });
        }
    } else {
      form.reset({ 
        id: '',
        type: 'url',
        slug: Math.random().toString(36).substring(2, 8),
        description: '',
        targetUrl: '', 
        fallbackUrls: '',
        password: '',
        scanLimit: null,
        vCardData: {
            firstName: '',
            lastName: '',
            company: '',
            title: '',
            phone: '',
            email: '',
            website: '',
            address: '',
        }
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
              <TableHead>Typ / Ziel</TableHead>
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
                         {qr.type === 'url' && qr.password && (
                          <Tooltip>
                            <TooltipTrigger>
                               <KeyRound className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Passwortgeschützt</TooltipContent>
                          </Tooltip>
                        )}
                        {qr.type === 'url' && qr.scanLimit && (
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
                       {qr.type === 'url' ? (
                          <a href={qr.targetUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {qr.targetUrl}
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Contact className="h-4 w-4" />
                            <span>vCard: {qr.vCardData.firstName} {qr.vCardData.lastName}</span>
                          </div>
                        )}
                    </TableCell>
                    <TableCell className="text-center">
                        {qr.type === 'url' ? qr.scanCount.toLocaleString() : 'N/A'}
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
                           {qr.type === 'url' && (
                             <DropdownMenuItem asChild>
                               <Link href={`/admin/qr-codes/${qr.id}/analytics`}>
                                 <BarChart2 className="mr-2 h-4 w-4" />
                                 Analytics
                               </Link>
                             </DropdownMenuItem>
                           )}
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
        <DialogContent className="sm:max-w-4xl grid-rows-[auto,1fr,auto]">
          <DialogHeader>
            <DialogTitle>{editingQR ? 'Bearbeiten' : 'Erstellen'} Sie einen QR-Code</DialogTitle>
            <DialogDescription>
              {editingQR ? 'Aktualisieren Sie die Details für Ihren QR-Code.' : 'Geben Sie die Details für Ihren neuen QR-Code ein.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6 overflow-hidden">
                <ScrollArea className="h-[60vh] md:h-auto md:pr-4">
                 <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>QR-Code-Typ</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="url" />
                                </FormControl>
                                <FormLabel className="font-normal">URL</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="vcard" />
                                </FormControl>
                                <FormLabel className="font-normal">vCard</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedType === 'url' ? (
                        <>
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
                        </>
                    ) : (
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <FormField control={form.control} name="vCardData.firstName" render={({ field }) => (<FormItem><FormLabel>Vorname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={form.control} name="vCardData.lastName" render={({ field }) => (<FormItem><FormLabel>Nachname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="vCardData.title" render={({ field }) => (<FormItem><FormLabel>Titel (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="vCardData.company" render={({ field }) => (<FormItem><FormLabel>Firma (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                             </div>
                            <FormField control={form.control} name="vCardData.phone" render={({ field }) => (<FormItem><FormLabel>Telefon (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="vCardData.email" render={({ field }) => (<FormItem><FormLabel>E-Mail (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="vCardData.website" render={({ field }) => (<FormItem><FormLabel>Webseite (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="vCardData.address" render={({ field }) => (<FormItem><FormLabel>Adresse (optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                         </div>
                    )}

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
                </div>
              </ScrollArea>
                <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-4 h-fit sticky top-0">
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
               <DialogFooter className="md:col-span-2">
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

    