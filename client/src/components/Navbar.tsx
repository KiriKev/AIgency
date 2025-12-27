import { Link, useLocation } from "wouter";
import { Search, User, Plus, Eye } from "lucide-react";
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
import { useState, useEffect, useRef, createContext, useContext } from "react";

interface NavbarProps {
  credits?: number;
  username?: string;
  onSearch?: (query: string) => void;
}

export const NavbarContext = createContext({ showNav: true });

export function useNavbarVisibility() {
  return useContext(NavbarContext);
}

export default function Navbar({ credits = 125, username = "Artist", onSearch }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const [showNav, setShowNav] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 50) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollYRef.current) {
        setShowNav(true);
      }
      
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${
      showNav ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="w-full px-3 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 lg:gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-2" 
              data-testid="link-home"
            >
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <span className="text-white font-bold text-xs">Art</span>
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">Arthub</span>
            </button>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1">
              <Button
                variant={location === '/showcase' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setLocation('/showcase')}
                className="gap-2"
                data-testid="nav-showroom"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Showroom</span>
              </Button>
            </nav>
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

          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1.5" 
              onClick={() => setLocation('/editor')}
              data-testid="button-create-prompt"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Prompt</span>
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
                <DropdownMenuItem onClick={() => setLocation('/my-gallery')} data-testid="menu-item-my-gallery">
                  My Gallery
                </DropdownMenuItem>
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
