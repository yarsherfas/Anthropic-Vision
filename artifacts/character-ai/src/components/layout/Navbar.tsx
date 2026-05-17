import { Link, useLocation } from "wouter";
import { MessageSquare, Users, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/characters", label: "Discover", icon: Users },
    { href: "/chats", label: "Chats", icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-serif italic font-bold">
            A
          </div>
          <span className="font-semibold text-lg tracking-tight">Aura</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/characters/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>
      </div>
    </nav>
  );
}
