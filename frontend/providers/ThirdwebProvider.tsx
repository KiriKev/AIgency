"use client";

/**
 * Thirdweb Provider for Next.js
 *
 * Wraps the application with Thirdweb's provider to enable x402 payment hooks.
 * This works alongside Privy - Privy handles wallet connection, Thirdweb handles payments.
 */

import { ThirdwebProvider as TWProvider } from "thirdweb/react";
import { ReactNode } from "react";

export function ThirdwebProvider({ children }: { children: ReactNode }) {
  return <TWProvider>{children}</TWProvider>;
}
