import { Flex, Text, Button } from "@radix-ui/themes";
import { redirect } from "next/navigation";


export default function Home() {
  return (
    redirect('/gallery')
  );
}
