"use client"


import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Editor() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background pt-16">
            <main className="w-full px-2 py-2">
                <PromptEditor onBack={() => router.push('/')} />
            </main>
        </div>
    );
}
