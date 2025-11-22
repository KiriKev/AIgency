import { Link } from "wouter";
import { Search, Coins, User, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  credits?: number;
  username?: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ credits = 125, username = "Artist", onSearch }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2" data-testid="link-home">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                PromptHub
              </span>
            </a>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prompts, artists, categories..."
                className="pl-9 w-full"
                onChange={(e) => onSearch?.(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
              <Search className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/50 border border-accent-border">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-semibold" data-testid="text-credits">{credits}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>

            <Button variant="default" size="sm" data-testid="button-buy-credits">
              Buy Credits
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-user-menu">
                  <User className="h-5 w-5" />
                </Button>
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
