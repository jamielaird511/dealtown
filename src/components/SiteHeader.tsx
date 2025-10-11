import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MapPin className="h-6 w-6" />
          <span className="text-xl">Dealtown</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Deals
          </Link>
          <Link 
            href="/submit" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Submit a Deal
          </Link>
          <Link 
            href="/admin" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Admin
          </Link>
          <Button size="sm" variant="default">
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  );
}

