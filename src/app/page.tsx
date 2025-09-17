import { LoginForm } from "@/components/auth/login-form";
import Logo from "@/components/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex w-full max-w-md flex-col items-center space-y-6">
        <Logo />
        <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Benutze `mexx@web.de` / `qrcoder12345678!` für Admin-Zugang.
        </p>
      </div>
    </main>
  );
}
