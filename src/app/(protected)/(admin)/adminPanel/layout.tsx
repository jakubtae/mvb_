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
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex gap-2 max-w-[500px] flex-wrap">
        <Button
          variant="secondary"
          className="flex-grow flex-shrink basis-0"
          asChild
        >
          <Link href="/adminPanel">Admin Dashboard</Link>
        </Button>
        <Button
          variant="secondary"
          className="flex-grow flex-shrink basis-0"
          asChild
        >
          <Link href="/adminPanel/features">Features Panel</Link>
        </Button>
        <Button
          variant="secondary"
          className="flex-grow flex-shrink basis-0"
          asChild
        >
          <Link href="/adminPanel/users">Users Panel</Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
