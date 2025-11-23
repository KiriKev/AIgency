import { Link, useLocation } from "wouter";
import { Search, Coins, User, Plus, Home, Eye, FileEdit, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface NavbarProps {
  credits?: number;
  username?: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ credits = 125, username = "Artist", onSearch }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNav(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${
      showNav ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="w-full px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-2" 
              data-testid="link-home"
            >
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
            </button>

            {/* Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="button-nav-menu"
                >
                  <Menu className="h-4 w-4" />
                  <span className="hidden sm:inline">Navigation</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setLocation('/')} data-testid="menu-item-art-hub">
                  <Home className="h-4 w-4 mr-2" />
                  Art Hub
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/showcase')} data-testid="menu-item-showroom">
                  <Eye className="h-4 w-4 mr-2" />
                  Showroom
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/editor')} data-testid="menu-item-create">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Create Prompt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prompts..."
                className="pl-9 w-full"
                onChange={(e) => onSearch?.(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/50 border border-accent-border">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-semibold text-foreground" data-testid="text-credits">{credits}</span>
            </div>

            <Button variant="default" size="sm" data-testid="button-buy-credits">
              Buy Credits
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover-elevate active-elevate-2 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-muted-foreground">artist@example.com</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-item-my-prompts">
                  My Prompts
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-item-creations">
                  My Creations
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-item-settings">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-item-logout">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

    </header>
  );
}
