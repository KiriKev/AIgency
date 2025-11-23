import { Link, useLocation } from "wouter";
import { Search, Coins, User, Plus, Home, Eye, FileEdit } from "lucide-react";
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

interface NavbarProps {
  credits?: number;
  username?: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ credits = 125, username = "Artist", onSearch }: NavbarProps) {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-2" data-testid="link-home">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
              </a>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <a className={`px-4 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 ${location === '/' ? 'text-foreground' : 'text-muted-foreground'}`} data-testid="link-art-hub">
                  Art Hub
                </a>
              </Link>
              <Link href="/showcase">
                <a className={`px-4 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 ${location === '/showcase' ? 'text-foreground' : 'text-muted-foreground'}`} data-testid="link-showroom">
                  Showroom
                </a>
              </Link>
              <Link href="/editor">
                <a className={`px-4 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 ${location === '/editor' ? 'text-foreground' : 'text-muted-foreground'}`} data-testid="link-create-prompt">
                  Create Prompt
                </a>
              </Link>
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
        <div className="grid grid-cols-3 gap-1 p-2">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className={`flex flex-col h-auto py-2 gap-1 ${location === '/' ? 'text-foreground' : 'text-muted-foreground'}`}
            data-testid="mobile-link-art-hub"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Art Hub</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/showcase'}
            className={`flex flex-col h-auto py-2 gap-1 ${location === '/showcase' ? 'text-foreground' : 'text-muted-foreground'}`}
            data-testid="mobile-link-showroom"
          >
            <Eye className="h-5 w-5" />
            <span className="text-xs font-medium">Showroom</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/editor'}
            className={`flex flex-col h-auto py-2 gap-1 ${location === '/editor' ? 'text-foreground' : 'text-muted-foreground'}`}
            data-testid="mobile-link-create-prompt"
          >
            <FileEdit className="h-5 w-5" />
            <span className="text-xs font-medium">Create</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
