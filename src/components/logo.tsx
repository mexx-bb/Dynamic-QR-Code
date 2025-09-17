import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="rounded-lg bg-primary p-2 text-primary-foreground">
        <QrCode className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Dynamic QR</h1>
    </div>
  );
}
