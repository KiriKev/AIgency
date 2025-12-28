"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useState } from "react";
import { getQueryFn } from "@/lib/queryClient";
import PrivyWalletProvider from "./PrivyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    // Create QueryClient inside Client Component
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                queryFn: getQueryFn({ on401: "throw" }),
                refetchInterval: false,
                refetchOnWindowFocus: false,
                staleTime: Infinity,
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    }));

    return (
        <PrivyWalletProvider>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    {children}
                </TooltipProvider>
            </QueryClientProvider>
        </PrivyWalletProvider>
    );
}

