import Logo from '@/components/logo';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mb-8">
                <Logo />
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                <CardTitle>Willkommen zurück!</CardTitle>
                <CardDescription>Geben Sie Ihre Anmeldedaten ein, um auf Ihr Dashboard zuzugreifen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    );
}
