import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session || !session.user || session.user.role === "USER") {
    redirect("/dashboard");
  }
  return <div className="w-full flex flex-col gap-2">{children}</div>;
}
