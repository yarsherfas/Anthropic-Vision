import { Link, useLocation } from "wouter";
import { MessageSquare, Users, Plus, Home, LogOut, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const { user, signOut, loading } = useAuth();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/characters", label: "Discover", icon: Users },
    { href: "/chats", label: "Chats", icon: MessageSquare },
  ];

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "U";

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

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar className="w-9 h-9 border-2 border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card border-white/10">
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/5">
                    <Link href="/characters?mine=true">
                      <User className="w-4 h-4 mr-2" /> My Characters
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/5"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
