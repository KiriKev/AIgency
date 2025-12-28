"use client"

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, TextField, DropdownMenu, Avatar, Flex, Text } from "@radix-ui/themes";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { usePrivy } from "@privy-io/react-auth";

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
  const { ready, authenticated, user, login, logout } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);
  const router = useRouter();
  const [showNav, setShowNav] = useState(true);
  const lastScrollYRef = useRef(0);


  const email = user?.email?.address;
  const walletAddress = user?.wallet?.address;
  const googleAccount = user?.google;


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
    <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'
      }`}>
      <div className="w-full px-3 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 lg:gap-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 border-2 border-foreground rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
              <span className="text-black font-bold text-sm">L</span>
            </div>

            <Flex gap="2">
              <Button size="2" data-testid="button-arthub" onClick={() => router.push('/gallery')}>Art Hub</Button>
              <Button size="2" data-testid="button-showroom" onClick={() => router.push('/showcase')} >Showroom</Button>
              <Button size="2" data-testid="button-create-prompt" onClick={() => router.push('/editor')}>Create Prompt</Button>
            </Flex>

          </div>

          {/* Search bar */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <TextField.Root
              placeholder="Search prompts..."
              size="2"
              style={{ width: '100%' }}
              onChange={(e) => onSearch?.(e.target.value)}
              data-testid="input-search"
            >
              <TextField.Slot>
                <Search className="h-4 w-4" />
              </TextField.Slot>
            </TextField.Root>
          </div>

          {/* Search bar */}
          <Flex align="center" gap="2">
            {!authenticated ? (
              <Button size="2" data-testid="button-sign-in" disabled={disableLogin} onClick={login}>Sign In</Button>
            ) : (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <button style={{ borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }} data-testid="button-user-menu">
                    <Avatar size="3" radius="full" fallback={username.charAt(0)} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" style={{ minWidth: '14rem' }}>
                  <Flex p="2" gap="2" align="center">
                    <Text size="1" color="gray">{googleAccount?.email || walletAddress}</Text>
                  </Flex>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item onClick={() => router.push('/my-gallery')} data-testid="menu-item-my-gallery">
                    My Gallery
                  </DropdownMenu.Item>
                  <DropdownMenu.Item data-testid="menu-item-my-prompts">
                    My Prompts
                  </DropdownMenu.Item>
                  <DropdownMenu.Item data-testid="menu-item-creations">
                    My Creations
                  </DropdownMenu.Item>
                  <DropdownMenu.Item data-testid="menu-item-settings">
                    Settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item data-testid="menu-item-logout">
                    <Button size="2" data-testid="button-sign-in" onClick={logout}>Sign Out</Button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}
          </Flex>
        </div>
      </div>
    </header>
  );
}
