import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Link2, BarChart3, Contact, Zap } from 'lucide-react';
import Logo from '@/components/logo';
import Image from 'next/image';

const features = [
  {
    icon: <Link2 className="h-8 w-8 text-primary" />,
    title: 'Dynamische URLs',
    description: 'Ändern Sie das Ziel Ihres QR-Codes jederzeit, ohne ihn neu drucken zu müssen.',
  },
  {
    icon: <Contact className="h-8 w-8 text-primary" />,
    title: 'vCard Kontakte',
    description: 'Erstellen Sie digitale Visitenkarten, die mit einem Scan im Adressbuch landen.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Scan Analytics',
    description: 'Verfolgen Sie, wie oft, wann und wo Ihre QR-Codes gescannt werden.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Schnell & Zuverlässig',
    description: 'Unsere Infrastruktur sorgt für schnelle Weiterleitungen und maximale Verfügbarkeit.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Logo />
          <Button asChild>
            <Link href="/login">Anmelden</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40">
           <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
           <div className="container relative mx-auto text-center">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    Dynamische QR-Codes, die mehr können
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Erstellen, verwalten und analysieren Sie QR-Codes, die sich an Ihre Bedürfnisse anpassen. Ändern Sie Ziele, nutzen Sie vCards und erhalten Sie wertvolle Einblicke – alles an einem Ort.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                      <Button size="lg" asChild>
                        <Link href="/login">Jetzt kostenlos starten</Link>
                      </Button>
                    </div>
                </div>
                 <div className="mt-16 flow-root sm:mt-24">
                    <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                        <Image
                        src="https://picsum.photos/seed/dashboard/1200/600"
                        alt="App screenshot"
                        width={2432}
                        height={1442}
                        data-ai-hint="dashboard screenshot"
                        className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                        />
                    </div>
                </div>
           </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-secondary">
          <div className="container mx-auto">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Alles, was Sie für smarte QR-Codes brauchen</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Von einfachen Links bis hin zu komplexen Kampagnen – unsere Tools machen es möglich.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-background shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col items-center justify-center gap-4 py-8 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © {new Date().getFullYear()} Dynamic QR. Alle Rechte vorbehalten.
            </p>
        </div>
      </footer>
    </div>
  );
}
